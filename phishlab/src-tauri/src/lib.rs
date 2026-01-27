// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
extern crate bcrypt;
extern crate pkce;
extern crate reqwest;
extern crate tokio;

//use reqwest::Client;
/*use bcrypt::{hash, verify, DEFAULT_COST};

#[tauri::command]
fn sendRegisterForm(_name: &str, _firstname: &str, _email: &str, password: &str) -> String {
    let hash_password = hash(password, DEFAULT_COST).unwrap();
    format!("Password: {}, Password Hash {}", password, hash_password)
}*/

//----------------------------------------------------------
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use url::Url;

// === CONFIG ===
const KEYCLOAK: &str = "https://auth.phishlab.noryx.fr";
const REALM: &str = "phishlab";
const CLIENT_ID: &str = "phishlab";
const REDIRECT_URI: &str = "http://127.0.0.1:18181";
// ==============

/*fn sendLoginForm(_email: &str, password: &str) -> String {
    
    let hash_password = "$2b$12$01ptwBwbBWP4xxwD3dQtb.GLL1tb7aTBULtWdUAKnoFLwhy6SobyK";

    if verify(password, hash_password).unwrap_or(false) {
        format!("Pass valid !")
    } else {
        format!("Pass Invalid !")
    }
}*/
/*#[tauri::command]
async fn register() -> String {
    let auth_url = format!("{}/realms/{}/protocol/openid-connect/registrations", KEYCLOAK, REALM);
}*/

#[tauri::command]
async fn login() -> Result<String, String> {

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

    // 3️ Ouvrir navigateur
    // L’utilisateur va voir Keycloak, entrer ses identifiants, et valider.
    // map_err(...) transforme l’erreur en String pour matcher Result<String, String>.
    // ? : si erreur, on sort immédiatement de la fonction avec Err(...)
    tauri_plugin_opener::open_url(auth_url, None::<&str>).map_err(|e| e.to_string())?;

    // 4️ Attendre callback localhost
    let listener = TcpListener::bind("127.0.0.1:18181")
        .await
        .map_err(|e| e.to_string())?;

    let (mut socket, _) = listener.accept().await.map_err(|e| e.to_string())?;// On accepte UNE connexion : celle du navigateur quand Keycloak redirige vers localhost.

    let mut buf = [0u8; 4096];// Buffer de lecture : on lit la requête HTTP envoyée par le navigateur.
    let n = socket.read(&mut buf).await.map_err(|e| e.to_string())?;// On lit les bytes reçus sur la socket.
    let req = String::from_utf8_lossy(&buf[..n]);// On convertit ces bytes en texte lisible (sans planter si certains bytes sont bizarres).

    // Exemple: GET /?code=XXX HTTP/1.1
    // On prend la première ligne de la requête ("GET ... HTTP/1.1"),
    // puis on récupère le 2ème élément séparé par des espaces : le chemin "/?code=..."
    let path = req.lines().next().unwrap().split(' ').nth(1).unwrap();
    let url = Url::parse(&format!("http://localhost{}", path)).unwrap();// On transforme ce path en URL complète pour pouvoir parser les query params proprement.

    // On extrait la valeur du paramètre "code" dans l’URL.
    // Ce "code" est l’authorization code temporaire renvoyé par Keycloak après login réussi.
    let code = url
        .query_pairs()
        .find(|(k, _)| k == "code")  // on cherche la paire (clé, valeur) où clé == "code"
        .map(|(_, v)| v.to_string()) // on récupère la valeur (v) et on la transforme en String
        .ok_or("Pas de code reçu")?; // si pas trouvé, on retourne Err("Pas de code reçu")

    // Réponse navigateur : on envoie une petite page/texte HTTP pour que l’utilisateur voie un message.
    socket
        .write_all(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nLogin OK, vous pouvez fermer la page.")
        .await
        .unwrap();

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
    Ok(json)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}