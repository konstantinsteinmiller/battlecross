// swift-tools-version:5.9
import PackageDescription

// StoreKit 2 ships with the OS: the only dependency is the Tauri API package
// that `tauri ios init` / the build lays down at ../.tauri/tauri-api (same
// convention as tauri-plugin-levelplay). No xcframeworks, no unsafeFlags.
let package = Package(
    name: "tauri-plugin-iap",
    platforms: [
        .iOS(.v15),
    ],
    products: [
        .library(
            name: "tauri-plugin-iap",
            type: .static,
            targets: ["tauri-plugin-iap"]),
    ],
    dependencies: [
        .package(name: "Tauri", path: "../.tauri/tauri-api"),
    ],
    targets: [
        .target(
            name: "tauri-plugin-iap",
            dependencies: [
                .byName(name: "Tauri"),
            ],
            path: "Sources/tauri-plugin-iap",
            linkerSettings: [
                .linkedFramework("StoreKit"),
                .linkedFramework("Foundation"),
            ]),
    ]
)
