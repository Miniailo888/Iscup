import Foundation

// MARK: - Deal

struct Deal: Identifiable, Equatable {
    let id: Int
    let cat: DealCategory
    let seller: String
    let avatar: String
    let city: String
    let rating: Double
    let dealCount: Int
    let title: String
    let unit: String
    let retail: Int
    let group: Int
    let minQty: Int
    let maxQty: Int
    var joined: Int
    let needed: Int
    let days: Int
    let desc: String
    let tags: [String]
    let hot: Bool
    var photoData: Data?

    var pct: Int { min(100, Int(round(Double(joined) / Double(needed) * 100))) }
    var disc: Int { Int(round(Double(retail - group) / Double(retail) * 100)) }
    var savings: Int { retail - group }

    static func == (lhs: Deal, rhs: Deal) -> Bool { lhs.id == rhs.id }
}

enum DealCategory: String, CaseIterable {
    case all = "all"
    case farm = "farm"
    case honey = "honey"
    case veggies = "veggies"
    case dairy = "dairy"
    case food = "food"
    case handmade = "handmade"
    case cafe = "cafe"

    var label: String {
        switch self {
        case .all: return "Все"
        case .farm: return "Фермерське"
        case .honey: return "Мед"
        case .veggies: return "Овочі"
        case .dairy: return "Молочне"
        case .food: return "Їжа"
        case .handmade: return "Хендмейд"
        case .cafe: return "Кав'ярня"
        }
    }

    var icon: String {
        switch self {
        case .all: return "🏪"
        case .farm: return "🌾"
        case .honey: return "🍯"
        case .veggies: return "🥕"
        case .dairy: return "🧀"
        case .food: return "🍞"
        case .handmade: return "🧶"
        case .cafe: return "☕"
        }
    }
}

// MARK: - User

struct AppUser: Codable, Equatable {
    var name: String
    var email: String
    var phone: String
    var city: String
}

// MARK: - Seller

struct Seller {
    let name: String
    let avatar: String
    let fop: String
    let ipn: String
    let iban: String
    let bank: String
    let group: String
    let taxRate: String
    let city: String
    let rating: Double
}

// MARK: - Transaction

struct Transaction: Identifiable {
    let id: String
    let type: TransactionType
    let desc: String
    let amount: Int
    let date: String
}

enum TransactionType: String {
    case income
    case withdrawal
    case hold

    var icon: String {
        switch self {
        case .income: return "↓"
        case .withdrawal: return "↑"
        case .hold: return "◷"
        }
    }
}

// MARK: - Order

struct Order: Identifiable {
    let id: String
    let buyer: String
    let avatar: String
    let item: String
    let qty: Int
    let unit: String
    let amount: Int
    var status: OrderStatus
}

enum OrderStatus: String {
    case paid
    case done
    case expired
    case partial

    var label: String {
        switch self {
        case .paid: return "Оплачено"
        case .done: return "Видано"
        case .expired: return "Прострочено"
        case .partial: return "Частково"
        }
    }
}

// MARK: - Chat

struct Chat: Identifiable {
    let id: Int
    let name: String
    let avatar: String
    var last: String
    var time: String
    var unread: Int
    let online: Bool
}

struct ChatMessage: Identifiable {
    let id = UUID()
    let from: MessageSender
    let text: String
    let time: String
}

enum MessageSender {
    case me, them
}

// MARK: - Sort

enum DealSort: String, CaseIterable {
    case hot = "Популярні"
    case new = "Нові"
    case discount = "Знижка"
    case price = "Ціна"
    case rating = "Рейтинг"
}
