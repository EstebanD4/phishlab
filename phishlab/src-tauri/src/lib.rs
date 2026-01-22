// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
extern crate bcrypt;
use bcrypt::{hash, verify, DEFAULT_COST};

#[tauri::command]
fn sendRegisterForm(_name: &str, _firstname: &str, _email: &str, password: &str) -> String {
    let hash_password = hash(password, DEFAULT_COST).unwrap();
    format!("Password: {}, Password Hash {}", password, hash_password)
}

#[tauri::command]
fn sendLoginForm(_email: &str, password: &str) -> String {
    let hash_password = "$2b$12$01ptwBwbBWP4xxwD3dQtb.GLL1tb7aTBULtWdUAKnoFLwhy6SobyK";

    if verify(password, hash_password).unwrap_or(false) {
        format!("Pass valid !")
    } else {
        format!("Pass Invalid !")
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![sendRegisterForm])
        .invoke_handler(tauri::generate_handler![sendLoginForm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
