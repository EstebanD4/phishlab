extern crate bcrypt;
extern crate pkce;
extern crate reqwest;
extern crate tokio;

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use url::Url;

use tauri::{AppHandle, Manager};
use tauri::webview::WebviewWindowBuilder;
use tokio::sync::oneshot;

// === CONFIG ===
const KEYCLOAK: &str = "https://auth.phishlab.noryx.fr";
const REALM: &str = "phishlab";
const CLIENT_ID: &str = "phishlab";
const REDIRECT_URI: &str = "http://127.0.0.1:18181";
// ==============

#[tauri::command]
async fn login(app: AppHandle) -> Result<String, String> {

    let code_verifier = pkce::code_verifier(64); // Génère un "code_verifier" PKCE (secret aléatoire) de longueur 64.
    let code_challenge = pkce::code_challenge(&code_verifier); // Calcule le "code_challenge" à partir du verifier.
    let code_verifier = String::from_utf8(code_verifier).unwrap();// Convertit les bytes du verifier en String UTF-8.

    // 2️ Construire URL Keycloak
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
        urlencoding::encode(REDIRECT_URI), // On encode l’URL pour qu’elle soit valide dans une query string (espaces, /, :, etc.).
        code_challenge
    );

    // channel pour récupérer le code depuis le callback de navigation
    let (tx, rx) = oneshot::channel::<String>();

    // On va avoir besoin de partager tx avec la closure on_navigation
    let tx = std::sync::Arc::new(std::sync::Mutex::new(Some(tx)));

    let redirect_prefix = REDIRECT_URI.to_string();

    // Crée une fenêtre Tauri qui affiche Keycloak
    let win = WebviewWindowBuilder::new(&app, "oauth", tauri::WebviewUrl::External(auth_url.parse().unwrap()))
        .title("Connexion")
        .on_navigation({
            let tx = tx.clone();
            move |url| {
                // Intercepte le moment où Keycloak redirige vers ton redirect_uri
                if url.as_str().starts_with(&redirect_prefix) {
                    // parse ?code=...
                    if let Ok(parsed) = Url::parse(url.as_str()) {
                        if let Some((_, code)) = parsed.query_pairs().find(|(k, _)| k == "code") {
                            if let Some(tx) = tx.lock().unwrap().take() {
                                let _ = tx.send(code.to_string());
                            }
                        }
                    }
                    // on bloque cette navigation (pas besoin de charger la page localhost)
                    return false;
                }
                true
            }
        })
        .build()
        .map_err(|e| e.to_string())?;

    // attend le code
    let code = rx.await.map_err(|_| "Login annulé ou fenêtre fermée".to_string())?;

    // ferme la fenêtre oauth (force close)
    win.destroy().map_err(|e| e.to_string())?;

    // 5 Appel /token : échange du "code" contre des tokens (access_token, refresh_token, id_token)
    // On construit un client reqwest.
    let client = reqwest::Client::builder()
        .build()// build() crée le client HTTP.
        .map_err(|e| e.to_string())?;

    // On fait une requête POST vers l’endpoint token de Keycloak.
    let res = client
        .post(format!(
            "{}/realms/{}/protocol/openid-connect/token",
            KEYCLOAK, REALM
        ))
        .form(&[
            ("grant_type", "authorization_code"), // On dit qu’on veut échanger un authorization code.
            ("client_id", CLIENT_ID), // Identifie le client.
            ("code", &code), // Le code reçu dans le callback.
            ("redirect_uri", REDIRECT_URI), // Doit correspondre au redirect_uri utilisé dans /auth et autorisé côté Keycloak.
            ("code_verifier", &code_verifier), // PKCE : on envoie le verifier (secret) pour prouver qu’on est bien l’app qui a lancé le flow.
        ])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json = res.text().await.map_err(|e| e.to_string())?;

    // 6️ Retourner les tokens (brut, simple)
    Ok(json) // (ou retourne tes tokens)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}