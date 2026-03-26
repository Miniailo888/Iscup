import SwiftUI

struct ContentView: View {
    @StateObject private var state = AppState()
    @State private var selectedTab = 0
    @State private var showCreateDeal = false

    var isLightTheme: Bool {
        state.themeType == .light || state.themeType == .cream
    }

    var body: some View {
        Group {
            if state.isLoggedIn {
                mainTabView
            } else {
                WelcomeView()
            }
        }
        .environmentObject(state)
        .preferredColorScheme(isLightTheme ? .light : .dark)
        .onAppear {
            state.loadUser()
            state.loadTheme()
        }
    }

    var mainTabView: some View {
        ZStack {
            TabView(selection: $selectedTab) {
                MarketView()
                    .tabItem {
                        Image(systemName: "house.fill")
                        Text("Головна")
                    }
                    .tag(0)

                if state.user != nil {
                    QRHubView()
                        .tabItem {
                            Image(systemName: "qrcode")
                            Text("QR")
                        }
                        .tag(1)

                    // Placeholder view for the "+" tab -- triggers sheet
                    Color.clear
                        .tabItem {
                            Image(systemName: "plus.circle.fill")
                            Text("+Оголошення")
                        }
                        .tag(2)

                    SellerDashboardView()
                        .tabItem {
                            Image(systemName: "briefcase.fill")
                            Text("Бiзнес")
                        }
                        .tag(3)
                }

                WalletView()
                    .tabItem {
                        Image(systemName: "wallet.pass.fill")
                        Text("Гаманець")
                    }
                    .tag(4)
            }
            .tint(state.theme.accent)
            .onChange(of: selectedTab) { newValue in
                if newValue == 2 {
                    showCreateDeal = true
                    // Reset to previous tab so the empty view is not displayed
                    DispatchQueue.main.async {
                        selectedTab = 0
                    }
                }
            }
        }
        .sheet(isPresented: $showCreateDeal) {
            CreateDealView()
                .environmentObject(state)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
