fn main() {
    // Existing tauri build
    tauri_build::build();

    // Compile protobuf
    prost_build::Config::new()
        .compile_protos(&["proto/google_authenticator.proto"], &["proto/"])
        .expect("Failed to compile protos");
}
