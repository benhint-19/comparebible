#!/bin/bash
# Remove Facebook SDK dependency from @capacitor-firebase/authentication SPM package.
# We only need Google + Apple sign-in, not Facebook.
# This runs as a postinstall script so it survives npm ci / npm install.

PLUGIN_PKG="node_modules/@capacitor-firebase/authentication/Package.swift"

if [ ! -f "$PLUGIN_PKG" ]; then
  echo "[patch] @capacitor-firebase/authentication not installed, skipping"
  exit 0
fi

# Replace the Package.swift with a version that excludes Facebook
cat > "$PLUGIN_PKG" << 'SWIFT'
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorFirebaseAuthentication",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorFirebaseAuthentication",
            targets: ["FirebaseAuthenticationPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", .upToNextMajor(from: "12.7.0")),
        .package(url: "https://github.com/google/GoogleSignIn-iOS", from: "9.0.0")
    ],
    targets: [
        .target(
            name: "FirebaseAuthenticationPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseCore", package: "firebase-ios-sdk"),
                .product(name: "GoogleSignIn", package: "GoogleSignIn-iOS")
            ],
            path: "ios/Plugin",
            swiftSettings: [
                .define("RGCFA_INCLUDE_GOOGLE")
            ]),
        .testTarget(
            name: "FirebaseAuthenticationPluginTests",
            dependencies: ["FirebaseAuthenticationPlugin"],
            path: "ios/PluginTests")
    ]
)
SWIFT

echo "[patch] Removed Facebook SDK from @capacitor-firebase/authentication Package.swift"
