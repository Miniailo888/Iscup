import Foundation

class APIService {
    static let shared = APIService()
    let baseURL = "https://iscup-production-25c2.up.railway.app/api"
    let botUsername = "spilnokupbot"

    private var accessToken: String? {
        get { UserDefaults.standard.string(forKey: "spilnokup_token") }
        set { UserDefaults.standard.set(newValue, forKey: "spilnokup_token") }
    }

    private var refreshToken: String? {
        get { UserDefaults.standard.string(forKey: "spilnokup_refresh") }
        set { UserDefaults.standard.set(newValue, forKey: "spilnokup_refresh") }
    }

    var isLoggedIn: Bool {
        accessToken != nil
    }

    // MARK: - Auth

    func sendOtp(phone: String) async throws -> SendOtpResponse {
        let body: [String: Any] = ["phone": phone]
        let data = try await request(path: "/auth/send-otp", method: "POST", body: body)
        return try JSONDecoder().decode(SendOtpResponse.self, from: data)
    }

    func checkTelegram(telegramToken: String) async throws -> Bool {
        let body: [String: Any] = ["telegramToken": telegramToken]
        let data = try await request(path: "/telegram/check", method: "POST", body: body)
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let codeSent = json["codeSent"] as? Bool {
            return codeSent
        }
        return false
    }

    func verifyOtp(phone: String, otp: String, name: String, city: String) async throws -> VerifyOtpResponse {
        let body: [String: Any] = ["phone": phone, "otp": otp, "name": name, "city": city]
        let data = try await request(path: "/auth/verify-otp", method: "POST", body: body)
        let response = try JSONDecoder().decode(VerifyOtpResponse.self, from: data)

        if let token = response.accessToken {
            accessToken = token
        }
        if let refresh = response.refreshToken {
            refreshToken = refresh
        }

        return response
    }

    // MARK: - Telegram Deep Link

    var telegramBotURL: URL? {
        URL(string: "https://t.me/\(botUsername)")
    }

    func telegramStartURL(phone: String) -> URL? {
        let cleanPhone = phone.replacingOccurrences(of: " ", with: "")
        return URL(string: "tg://resolve?domain=\(botUsername)&start=\(cleanPhone)")
    }

    func telegramWebStartURL(phone: String) -> URL? {
        let cleanPhone = phone.replacingOccurrences(of: " ", with: "")
        return URL(string: "https://t.me/\(botUsername)?start=\(cleanPhone)")
    }

    // MARK: - Deals

    func fetchDeals(category: String? = nil, city: String? = nil, sort: String? = nil, limit: Int? = nil, offset: Int? = nil) async throws -> [APIDeal] {
        var params: [String] = []
        if let category = category, category != "all" { params.append("category=\(category)") }
        if let city = city, city != "all" {
            let encoded = city.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? city
            params.append("city=\(encoded)")
        }
        if let sort = sort { params.append("sort=\(sort)") }
        if let limit = limit { params.append("limit=\(limit)") }
        if let offset = offset { params.append("offset=\(offset)") }
        let query = params.isEmpty ? "" : "?\(params.joined(separator: "&"))"
        let data = try await request(path: "/deals\(query)")
        let decoder = JSONDecoder()
        // Try to decode as array first, then as wrapper object
        if let deals = try? decoder.decode([APIDeal].self, from: data) {
            return deals
        }
        if let wrapper = try? decoder.decode(APIDealsResponse.self, from: data) {
            return wrapper.deals
        }
        return []
    }

    func fetchDeal(id: String) async throws -> APIDeal {
        let data = try await request(path: "/deals/\(id)")
        return try JSONDecoder().decode(APIDeal.self, from: data)
    }

    func createDeal(_ deal: [String: Any]) async throws -> APIDeal {
        let data = try await request(path: "/deals", method: "POST", body: deal)
        return try JSONDecoder().decode(APIDeal.self, from: data)
    }

    func fetchSellerDeals() async throws -> [APIDeal] {
        let data = try await request(path: "/deals/seller/my")
        let decoder = JSONDecoder()
        if let deals = try? decoder.decode([APIDeal].self, from: data) {
            return deals
        }
        if let wrapper = try? decoder.decode(APIDealsResponse.self, from: data) {
            return wrapper.deals
        }
        return []
    }

    func deleteDeal(id: String) async throws {
        _ = try await request(path: "/deals/\(id)", method: "DELETE")
    }

    // MARK: - Orders

    func createOrder(dealId: String, quantity: Int) async throws -> APIOrder {
        let body: [String: Any] = ["dealId": dealId, "quantity": quantity]
        let data = try await request(path: "/orders", method: "POST", body: body)
        return try JSONDecoder().decode(APIOrder.self, from: data)
    }

    func fetchMyOrders() async throws -> [APIOrder] {
        let data = try await request(path: "/orders/my")
        let decoder = JSONDecoder()
        if let orders = try? decoder.decode([APIOrder].self, from: data) {
            return orders
        }
        if let wrapper = try? decoder.decode(APIOrdersResponse.self, from: data) {
            return wrapper.orders
        }
        return []
    }

    func fetchSellerOrders() async throws -> [APIOrder] {
        let data = try await request(path: "/orders/seller")
        let decoder = JSONDecoder()
        if let orders = try? decoder.decode([APIOrder].self, from: data) {
            return orders
        }
        if let wrapper = try? decoder.decode(APIOrdersResponse.self, from: data) {
            return wrapper.orders
        }
        return []
    }

    // MARK: - QR

    func generateQR(orderId: String) async throws -> APIQRResponse {
        let data = try await request(path: "/qr/generate/\(orderId)", method: "POST")
        return try JSONDecoder().decode(APIQRResponse.self, from: data)
    }

    func verifyQR(token: String) async throws -> APIQRVerifyResponse {
        let body: [String: Any] = ["token": token]
        let data = try await request(path: "/qr/verify", method: "POST", body: body)
        return try JSONDecoder().decode(APIQRVerifyResponse.self, from: data)
    }

    // MARK: - Chat

    func fetchConversations() async throws -> [APIConversation] {
        let data = try await request(path: "/chat/conversations")
        let decoder = JSONDecoder()
        if let convs = try? decoder.decode([APIConversation].self, from: data) {
            return convs
        }
        if let wrapper = try? decoder.decode(APIConversationsResponse.self, from: data) {
            return wrapper.conversations
        }
        return []
    }

    func createConversation(sellerId: String, dealId: String) async throws -> APIConversation {
        let body: [String: Any] = ["sellerId": sellerId, "dealId": dealId]
        let data = try await request(path: "/chat/conversations", method: "POST", body: body)
        return try JSONDecoder().decode(APIConversation.self, from: data)
    }

    func fetchMessages(conversationId: String) async throws -> [APIMessage] {
        let data = try await request(path: "/chat/\(conversationId)/messages")
        let decoder = JSONDecoder()
        if let msgs = try? decoder.decode([APIMessage].self, from: data) {
            return msgs
        }
        if let wrapper = try? decoder.decode(APIMessagesResponse.self, from: data) {
            return wrapper.messages
        }
        return []
    }

    func sendMessage(conversationId: String, text: String) async throws -> APIMessage {
        let body: [String: Any] = ["text": text]
        let data = try await request(path: "/chat/\(conversationId)/messages", method: "POST", body: body)
        return try JSONDecoder().decode(APIMessage.self, from: data)
    }

    func deleteMessage(messageId: String) async throws {
        _ = try await request(path: "/chat/messages/\(messageId)", method: "DELETE")
    }

    func fetchUnreadCount() async throws -> Int {
        let data = try await request(path: "/chat/unread")
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let count = json["count"] as? Int {
            return count
        }
        return 0
    }

    // MARK: - Wallet

    func fetchWallet() async throws -> APIWallet {
        let data = try await request(path: "/wallet")
        return try JSONDecoder().decode(APIWallet.self, from: data)
    }

    func withdrawFunds(amount: Int) async throws {
        let body: [String: Any] = ["amount": amount]
        _ = try await request(path: "/wallet/withdraw", method: "POST", body: body)
    }

    // MARK: - Support

    func sendSupportMessage(message: String, userName: String? = nil, userPhone: String? = nil, userDisplayId: String? = nil) async throws {
        var body: [String: Any] = ["message": message]
        if let userName = userName { body["userName"] = userName }
        if let userPhone = userPhone { body["userPhone"] = userPhone }
        if let userDisplayId = userDisplayId { body["userDisplayId"] = userDisplayId }
        _ = try await request(path: "/telegram/support", method: "POST", body: body)
    }

    func getSupportReplies(phone: String) async throws -> [APISupportReply] {
        let encoded = phone.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? phone
        let data = try await request(path: "/telegram/support/replies?phone=\(encoded)")
        let decoder = JSONDecoder()
        if let replies = try? decoder.decode([APISupportReply].self, from: data) {
            return replies
        }
        if let wrapper = try? decoder.decode(APISupportRepliesResponse.self, from: data) {
            return wrapper.replies
        }
        return []
    }

    // MARK: - Logout

    func logout() {
        accessToken = nil
        refreshToken = nil
        UserDefaults.standard.removeObject(forKey: "spilnokup_user")
    }

    // MARK: - Network

    private func request(path: String, method: String = "GET", body: [String: Any]? = nil) async throws -> Data {
        guard let url = URL(string: baseURL + path) else {
            throw APIError.invalidURL
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 15

        if let token = accessToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            req.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await URLSession.shared.data(for: req)

        guard let http = response as? HTTPURLResponse else {
            throw APIError.unknown
        }

        if http.statusCode == 401, let refresh = refreshToken {
            let refreshed = try await refreshAccessToken(refresh)
            if refreshed {
                req.setValue("Bearer \(accessToken ?? "")", forHTTPHeaderField: "Authorization")
                let (retryData, retryResp) = try await URLSession.shared.data(for: req)
                guard let retryHttp = retryResp as? HTTPURLResponse, retryHttp.statusCode < 400 else {
                    throw APIError.unauthorized
                }
                return retryData
            }
        }

        if http.statusCode >= 400 {
            if let errResp = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.server(errResp.error)
            }
            throw APIError.httpError(http.statusCode)
        }

        return data
    }

    private func refreshAccessToken(_ token: String) async throws -> Bool {
        guard let url = URL(string: baseURL + "/auth/refresh") else { return false }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["refreshToken": token])

        let (data, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else { return false }

        if let resp = try? JSONDecoder().decode(RefreshResponse.self, from: data) {
            accessToken = resp.accessToken
            return true
        }
        return false
    }
}

// MARK: - Auth Response Models

struct SendOtpResponse: Codable {
    let message: String
    let otp: String?
    let telegram: Bool?
    let telegramToken: String?
}

struct VerifyOtpResponse: Codable {
    let accessToken: String?
    let refreshToken: String?
    let user: APIUser?
}

struct APIUser: Codable {
    let id: String
    let displayId: String?
    let name: String?
    let city: String?
    let role: String?
    let avatarUrl: String?
    let isVerified: Bool?
}

struct RefreshResponse: Codable {
    let accessToken: String
}

struct ErrorResponse: Codable {
    let error: String
}

// MARK: - API Deal Model

struct APIDeal: Codable {
    let id: String?
    let _id: String?
    let title: String?
    let description: String?
    let category: String?
    let city: String?
    let price: Double?
    let retailPrice: Double?
    let groupPrice: Double?
    let unit: String?
    let minQuantity: Int?
    let maxQuantity: Int?
    let minQty: Int?
    let maxQty: Int?
    let currentParticipants: Int?
    let joined: Int?
    let targetParticipants: Int?
    let needed: Int?
    let daysLeft: Int?
    let days: Int?
    let isHot: Bool?
    let hot: Bool?
    let seller: APIDealSeller?
    let sellerName: String?
    let sellerAvatar: String?
    let sellerRating: Double?
    let sellerDealCount: Int?
    let tags: [String]?
    let imageUrl: String?
    let photoUrl: String?
    let createdAt: String?

    var resolvedId: String {
        id ?? _id ?? UUID().uuidString
    }

    enum CodingKeys: String, CodingKey {
        case id, _id, title, description, category, city
        case price, retailPrice, groupPrice, unit
        case minQuantity, maxQuantity, minQty, maxQty
        case currentParticipants, joined, targetParticipants, needed
        case daysLeft, days, isHot, hot
        case seller, sellerName, sellerAvatar, sellerRating, sellerDealCount
        case tags, imageUrl, photoUrl, createdAt
    }
}

struct APIDealSeller: Codable {
    let id: String?
    let _id: String?
    let name: String?
    let avatarUrl: String?
    let rating: Double?
    let dealCount: Int?

    enum CodingKeys: String, CodingKey {
        case id, _id, name, avatarUrl, rating, dealCount
    }
}

struct APIDealsResponse: Codable {
    let deals: [APIDeal]
}

// MARK: - API Order Model

struct APIOrder: Codable {
    let id: String?
    let _id: String?
    let dealId: String?
    let quantity: Int?
    let totalAmount: Double?
    let amount: Double?
    let status: String?
    let buyer: APIOrderBuyer?
    let buyerName: String?
    let buyerAvatar: String?
    let deal: APIOrderDeal?
    let dealTitle: String?
    let dealUnit: String?
    let createdAt: String?

    var resolvedId: String {
        id ?? _id ?? UUID().uuidString
    }

    enum CodingKeys: String, CodingKey {
        case id, _id, dealId, quantity, totalAmount, amount, status
        case buyer, buyerName, buyerAvatar
        case deal, dealTitle, dealUnit, createdAt
    }
}

struct APIOrderBuyer: Codable {
    let id: String?
    let _id: String?
    let name: String?
    let avatarUrl: String?

    enum CodingKeys: String, CodingKey {
        case id, _id, name, avatarUrl
    }
}

struct APIOrderDeal: Codable {
    let id: String?
    let _id: String?
    let title: String?
    let unit: String?

    enum CodingKeys: String, CodingKey {
        case id, _id, title, unit
    }
}

struct APIOrdersResponse: Codable {
    let orders: [APIOrder]
}

// MARK: - API QR Models

struct APIQRResponse: Codable {
    let token: String?
    let qrCode: String?
    let qrUrl: String?
}

struct APIQRVerifyResponse: Codable {
    let success: Bool?
    let order: APIOrder?
    let message: String?
}

// MARK: - API Chat Models

struct APIConversation: Codable {
    let id: String?
    let _id: String?
    let participants: [APIConversationParticipant]?
    let lastMessage: APILastMessage?
    let deal: APIConversationDeal?
    let dealId: String?
    let sellerId: String?
    let otherUser: APIConversationParticipant?
    let unreadCount: Int?
    let createdAt: String?
    let updatedAt: String?

    var resolvedId: String {
        id ?? _id ?? UUID().uuidString
    }

    enum CodingKeys: String, CodingKey {
        case id, _id, participants, lastMessage, deal, dealId, sellerId
        case otherUser, unreadCount, createdAt, updatedAt
    }
}

struct APIConversationParticipant: Codable {
    let id: String?
    let _id: String?
    let name: String?
    let avatarUrl: String?

    enum CodingKeys: String, CodingKey {
        case id, _id, name, avatarUrl
    }
}

struct APILastMessage: Codable {
    let text: String?
    let createdAt: String?
    let sender: String?
}

struct APIConversationDeal: Codable {
    let id: String?
    let _id: String?
    let title: String?

    enum CodingKeys: String, CodingKey {
        case id, _id, title
    }
}

struct APIConversationsResponse: Codable {
    let conversations: [APIConversation]
}

struct APIMessage: Codable {
    let id: String?
    let _id: String?
    let text: String?
    let sender: APIMessageSender?
    let senderId: String?
    let conversationId: String?
    let createdAt: String?

    var resolvedId: String {
        id ?? _id ?? UUID().uuidString
    }

    enum CodingKeys: String, CodingKey {
        case id, _id, text, sender, senderId, conversationId, createdAt
    }
}

struct APIMessageSender: Codable {
    let id: String?
    let _id: String?
    let name: String?

    enum CodingKeys: String, CodingKey {
        case id, _id, name
    }
}

struct APIMessagesResponse: Codable {
    let messages: [APIMessage]
}

// MARK: - API Wallet Model

struct APIWallet: Codable {
    let balance: Double?
    let availableBalance: Double?
    let transactions: [APITransaction]?
}

struct APITransaction: Codable {
    let id: String?
    let _id: String?
    let type: String?
    let description: String?
    let desc: String?
    let amount: Double?
    let createdAt: String?
    let date: String?

    var resolvedId: String {
        id ?? _id ?? UUID().uuidString
    }

    enum CodingKeys: String, CodingKey {
        case id, _id, type, description, desc, amount, createdAt, date
    }
}

// MARK: - Support Reply Model

struct APISupportReply: Codable {
    let id: String?
    let _id: String?
    let text: String?
    let message: String?
    let createdAt: String?

    var resolvedId: String {
        id ?? _id ?? UUID().uuidString
    }

    enum CodingKeys: String, CodingKey {
        case id, _id, text, message, createdAt
    }
}

struct APISupportRepliesResponse: Codable {
    let replies: [APISupportReply]
}

// MARK: - Error

enum APIError: Error, LocalizedError {
    case invalidURL
    case unauthorized
    case unknown
    case httpError(Int)
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Невірний URL"
        case .unauthorized: return "Сесія закінчилась"
        case .unknown: return "Невідома помилка"
        case .httpError(let code): return "Помилка \(code)"
        case .server(let msg): return msg
        }
    }
}
