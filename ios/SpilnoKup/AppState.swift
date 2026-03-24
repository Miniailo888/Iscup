import SwiftUI

class AppState: ObservableObject {
    @Published var deals: [Deal] = SampleData.deals
    @Published var user: AppUser? = nil
    @Published var isGuest: Bool = false
    @Published var joinedDeals: Set<Int> = []
    @Published var themeType: ThemeType = .ocean
    @Published var balance: Int = 12840
    @Published var transactions: [Transaction] = SampleData.transactions
    @Published var orders: [Order] = SampleData.orders
    @Published var chats: [Chat] = SampleData.chats
    @Published var chatMessages: [Int: [ChatMessage]] = SampleData.chatMessages

    var theme: AppTheme { AppTheme.theme(for: themeType) }
    var isLoggedIn: Bool { user != nil || isGuest }
    var availableBalance: Int { Int(Double(balance) * 0.75) }

    func joinDeal(_ dealId: Int) {
        joinedDeals.insert(dealId)
        if let idx = deals.firstIndex(where: { $0.id == dealId }) {
            deals[idx].joined += 1
        }
    }

    func isJoined(_ dealId: Int) -> Bool {
        joinedDeals.contains(dealId)
    }

    func topUp(_ amount: Int) {
        balance += amount
        transactions.insert(Transaction(
            id: "T\(transactions.count + 1)",
            type: .income,
            desc: "Поповнення балансу",
            amount: amount,
            date: "24.03 · \(String(format: "%02d:%02d", Int.random(in: 10...23), Int.random(in: 0...59)))"
        ), at: 0)
    }

    func withdraw(_ amount: Int) {
        balance -= amount
        transactions.insert(Transaction(
            id: "T\(transactions.count + 1)",
            type: .withdrawal,
            desc: "Виведення на IBAN",
            amount: amount,
            date: "24.03 · \(String(format: "%02d:%02d", Int.random(in: 10...23), Int.random(in: 0...59)))"
        ), at: 0)
    }

    func sendMessage(chatId: Int, text: String) {
        let msg = ChatMessage(from: .me, text: text, time: currentTime())
        if chatMessages[chatId] != nil {
            chatMessages[chatId]?.append(msg)
        } else {
            chatMessages[chatId] = [msg]
        }
        if let idx = chats.firstIndex(where: { $0.id == chatId }) {
            chats[idx].last = text
            chats[idx].time = currentTime()
        }
        // Auto-reply after delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            let replies = ["Дякуємо за повідомлення!", "Зрозуміло, дякую!", "Добре, чекайте на підтвердження!", "Скоро відповімо!"]
            let reply = ChatMessage(from: .them, text: replies.randomElement()!, time: self?.currentTime() ?? "")
            self?.chatMessages[chatId]?.append(reply)
            if let idx = self?.chats.firstIndex(where: { $0.id == chatId }) {
                self?.chats[idx].last = reply.text
                self?.chats[idx].time = reply.time
                self?.chats[idx].unread += 1
            }
        }
    }

    func addDeal(_ deal: Deal) {
        deals.insert(deal, at: 0)
    }

    private func currentTime() -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: Date())
    }

    func saveUser() {
        if let user = user, let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: "spilnokup_user")
        }
    }

    func loadUser() {
        if let data = UserDefaults.standard.data(forKey: "spilnokup_user"),
           let user = try? JSONDecoder().decode(AppUser.self, from: data) {
            self.user = user
        }
    }

    func saveTheme() {
        UserDefaults.standard.set(themeType.rawValue, forKey: "spilnokup_theme")
    }

    func loadTheme() {
        if let raw = UserDefaults.standard.string(forKey: "spilnokup_theme"),
           let t = ThemeType(rawValue: raw) {
            themeType = t
        }
    }
}
