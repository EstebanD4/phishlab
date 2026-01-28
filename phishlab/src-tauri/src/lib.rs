#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate pkce;
extern crate reqwest;
extern crate tokio;

use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};

use once_cell::sync::Lazy;
use serde::Deserialize;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};
use tauri::webview::WebviewWindowBuilder;
use tokio::sync::{oneshot, RwLock};
use url::Url;

// === CONFIG ===
const KEYCLOAK: &str = "https://auth.phishlab.noryx.fr";
const REALM: &str = "phishlab";
const CLIENT_ID: &str = "phishlab";
const REDIRECT_URI: &str = "http://127.0.0.1:18181";
// ==============

// --------------------
// JWKS cache + structs
// --------------------

static JWKS_CACHE: Lazy<RwLock<Option<CachedKeys>>> = Lazy::new(|| RwLock::new(None));

#[derive(Clone)]
struct CachedKeys {
    fetched_at: Instant,
    keys_by_kid: HashMap<String, DecodingKey>,
}

#[derive(Debug, Deserialize)]
struct Jwks {
    keys: Vec<Jwk>,
}

#[derive(Debug, Deserialize)]
struct Jwk {
    kid: String,
    kty: String,
    n: String,
    e: String,
}

#[derive(Debug, Deserialize)]
struct Claims {
    exp: usize,
    iss: String,
    azp: Option<String>, // ✅ utile pour vérifier que le token est pour ton client
    aud: Option<serde_json::Value>, // optionnel (pas utilisé ici)
}

async fn get_jwks_keys(realm_url: &str) -> Result<HashMap<String, DecodingKey>, String> {
    let ttl = Duration::from_secs(600); // 10 min

    // 1) cache check
    {
        let guard = JWKS_CACHE.read().await;
        if let Some(c) = guard.as_ref() {
            if c.fetched_at.elapsed() < ttl {
                return Ok(c.keys_by_kid.clone());
            }
        }
    }

    // 2) fetch JWKS
    let jwks_url = format!(
        "{}/protocol/openid-connect/certs",
        realm_url.trim_end_matches('/')
    );

    let jwks: Jwks = reqwest::Client::new()
        .get(jwks_url)
        .send()
        .await
        .map_err(|e| format!("JWKS fetch error: {e}"))?
        .json()
        .await
        .map_err(|e| format!("JWKS json error: {e}"))?;

    let mut map = HashMap::new();
    for k in jwks.keys {
        if k.kty != "RSA" {
            continue;
        }
        let key = DecodingKey::from_rsa_components(&k.n, &k.e)
            .map_err(|e| format!("DecodingKey error: {e}"))?;
        map.insert(k.kid, key);
    }

    // 3) update cache
    {
        let mut guard = JWKS_CACHE.write().await;
        *guard = Some(CachedKeys {
            fetched_at: Instant::now(),
            keys_by_kid: map.clone(),
        });
    }

    Ok(map)
}

// --------------------
// Commands
// --------------------

#[tauri::command]
async fn login(app: AppHandle) -> Result<String, String> {
    let code_verifier_bytes = pkce::code_verifier(64);
    let code_challenge = pkce::code_challenge(&code_verifier_bytes);
    let code_verifier = String::from_utf8(code_verifier_bytes).map_err(|e| e.to_string())?;

    let auth_url = format!(
        "{}/realms/{}/protocol/openid-connect/auth\
        ?client_id={}\
        &response_type=code\
        &redirect_uri={}\
        &scope=openid\
        &code_challenge={}\
        &code_challenge_method=S256",
        KEYCLOAK,
        REALM,
        CLIENT_ID,
        urlencoding::encode(REDIRECT_URI),
        code_challenge
    );

    let (tx, rx) = oneshot::channel::<String>();
    let tx = Arc::new(Mutex::new(Some(tx)));
    let redirect_prefix = REDIRECT_URI.to_string();

    let win = WebviewWindowBuilder::new(
        &app,
        "oauth",
        tauri::WebviewUrl::External(auth_url.parse().unwrap()),
    )
        .title("Connexion")
        .on_navigation({
            let tx = tx.clone();
            move |url| {
                // Intercepte le redirect vers redirect_uri
                if url.as_str().starts_with(&redirect_prefix) {
                    if let Ok(parsed) = Url::parse(url.as_str()) {
                        if let Some((_, code)) = parsed.query_pairs().find(|(k, _)| k == "code") {
                            if let Some(tx) = tx.lock().unwrap().take() {
                                let _ = tx.send(code.to_string());
                            }
                        }
                    }
                    // bloque navigation vers localhost
                    return false;
                }
                true
            }
        })
        .build()
        .map_err(|e| e.to_string())?;

    let code = rx
        .await
        .map_err(|_| "Login annulé ou fenêtre fermée".to_string())?;

    // ferme la fenêtre oauth
    win.destroy().map_err(|e| e.to_string())?;

    // Exchange code -> tokens
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .post(format!(
            "{}/realms/{}/protocol/openid-connect/token",
            KEYCLOAK, REALM
        ))
        .form(&[
            ("grant_type", "authorization_code"),
            ("client_id", CLIENT_ID),
            ("code", &code),
            ("redirect_uri", REDIRECT_URI),
            ("code_verifier", &code_verifier),
        ])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json = res.text().await.map_err(|e| e.to_string())?;
    Ok(json)
}

#[tauri::command]
async fn verify_token(token: String) -> Result<bool, String> {
    if token.trim().is_empty() {
        return Ok(false);
    }

    let realm_url = format!("{}/realms/{}", KEYCLOAK.trim_end_matches('/'), REALM);
    let expected_issuer = realm_url.clone();

    // Header -> kid
    let header = decode_header(&token).map_err(|e| format!("Header decode error: {e}"))?;
    let kid = match header.kid {
        Some(k) => k,
        None => return Ok(false),
    };

    // Key by kid
    let keys = get_jwks_keys(&realm_url).await?;
    let key = match keys.get(&kid) {
        Some(k) => k,
        None => return Ok(false),
    };

    let mut validation = Validation::new(Algorithm::RS256);
    validation.validate_exp = true;

    // ✅ important pour ton cas : access_token a souvent aud="account"
    validation.validate_aud = false;

    validation.set_issuer(&[expected_issuer.as_str()]);

    let data = decode::<Claims>(&token, key, &validation)
        .map_err(|e| format!("JWT verify error: {e}"))?;

    // Issuer check (sécurité)
    if data.claims.iss != expected_issuer {
        return Ok(false);
    }

    // ✅ Check client via azp
    if data.claims.azp.as_deref() != Some(CLIENT_ID) {
        return Ok(false);
    }

    Ok(true)
}

// --------------------
// Tauri entry
// --------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![login, verify_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
