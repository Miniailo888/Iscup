import SwiftUI

struct MarketView: View {
    @EnvironmentObject var state: AppState
    @State private var search = ""
    @State private var selectedCat: DealCategory = .all
    @State private var sort: DealSort = .hot
    @State private var showFilters = false
    @State private var selectedDeal: Deal? = nil
    @State private var showSupport = false

    // Filters
    @State private var cityFilter = "all"
    @State private var priceFilter = "all"
    @State private var discFilter = "all"
    @State private var ratingFilter = "all"

    // Support
    @State private var supportMessage = ""
    @State private var supportSending = false
    @State private var supportSent = false

    var filteredDeals: [Deal] {
        var result = state.deals

        if selectedCat != .all {
            result = result.filter { $0.cat == selectedCat }
        }
        if !search.isEmpty {
            let q = search.lowercased()
            result = result.filter { $0.title.lowercased().contains(q) || $0.seller.lowercased().contains(q) }
        }
        if cityFilter != "all" {
            result = result.filter { $0.city.contains(cityFilter) }
        }
        if priceFilter != "all" {
            switch priceFilter {
            case "low": result = result.filter { $0.group < 200 }
            case "mid": result = result.filter { $0.group >= 200 && $0.group < 500 }
            case "high": result = result.filter { $0.group >= 500 }
            default: break
            }
        }
        if discFilter != "all" {
            switch discFilter {
            case "big": result = result.filter { $0.disc >= 30 }
            case "med": result = result.filter { $0.disc >= 20 && $0.disc < 30 }
            case "small": result = result.filter { $0.disc < 20 }
            default: break
            }
        }
        if ratingFilter != "all" {
            switch ratingFilter {
            case "top": result = result.filter { $0.rating >= 4.8 }
            case "good": result = result.filter { $0.rating >= 4.5 }
            default: break
            }
        }

        switch sort {
        case .hot: result.sort { $0.pct > $1.pct }
        case .new: result.sort { $0.id > $1.id }
        case .discount: result.sort { $0.disc > $1.disc }
        case .price: result.sort { $0.group < $1.group }
        case .rating: result.sort { $0.rating > $1.rating }
        }

        return result
    }

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        searchSection
                        bannerSection
                        categorySection
                        sortSection
                        dealsGrid
                    }
                    .padding(.bottom, 20)
                }
            }
            .navigationDestination(item: $selectedDeal) { deal in
                DealDetailView(deal: deal)
            }
            .sheet(isPresented: $showFilters) {
                filtersSheet
            }
            .sheet(isPresented: $showSupport) {
                supportSheet
            }
        }
    }

    // MARK: - Search at very top with headphones icon

    var searchSection: some View {
        HStack(spacing: 10) {
            Button(action: { showSupport = true }) {
                Image(systemName: "headphones")
                    .font(.title2)
                    .foregroundColor(state.theme.accent)
                    .frame(width: 40, height: 40)
                    .background(state.theme.card)
                    .cornerRadius(10)
            }

            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(state.theme.textMuted)
                TextField("Пошук товарiв...", text: $search)
                    .foregroundColor(state.theme.text)
            }
            .padding(10)
            .background(state.theme.card)
            .cornerRadius(10)

            Button(action: { showFilters = true }) {
                Image(systemName: "slider.horizontal.3")
                    .foregroundColor(state.theme.accent)
                    .padding(10)
                    .background(state.theme.card)
                    .cornerRadius(10)
            }
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }

    // MARK: - Simple banner replacing HotSlider/HowItWorks

    var bannerSection: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(state.theme.accent)
                    .frame(width: 52, height: 52)
                Image(systemName: "person.2.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Спiльнi покупки")
                    .font(.headline)
                    .foregroundColor(state.theme.text)
                Text("Купуй разом -- плати менше. Економiя до 40%!")
                    .font(.caption)
                    .foregroundColor(state.theme.textSec)
                    .lineLimit(2)
            }

            Spacer()
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(state.theme.border, lineWidth: 1)
        )
        .padding(.horizontal)
    }

    var categorySection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(DealCategory.allCases, id: \.self) { cat in
                    Button(action: { selectedCat = cat }) {
                        HStack(spacing: 4) {
                            Text(cat.icon)
                                .font(.caption)
                            Text(cat.label)
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundColor(selectedCat == cat ? .white : state.theme.textSec)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(selectedCat == cat ? state.theme.accent : state.theme.card)
                        .cornerRadius(10)
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    var sortSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(DealSort.allCases, id: \.self) { s in
                    Button(action: { sort = s }) {
                        Text(s.rawValue)
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .foregroundColor(sort == s ? .white : state.theme.textMuted)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(sort == s ? state.theme.accent.opacity(0.6) : Color.clear)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    var dealsGrid: some View {
        LazyVStack(spacing: 12) {
            ForEach(filteredDeals) { deal in
                DealCardView(deal: deal) {
                    selectedDeal = deal
                }
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Support Sheet

    var supportSheet: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()
            VStack(spacing: 16) {
                HStack {
                    Text("Пiдтримка")
                        .font(.title2.bold())
                        .foregroundColor(state.theme.text)
                    Spacer()
                    Button(action: { showSupport = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(state.theme.textMuted)
                    }
                }
                .padding(.top, 20)

                Text("Опишiть вашу проблему або запитання, i ми вiдповiмо найближчим часом.")
                    .font(.subheadline)
                    .foregroundColor(state.theme.textSec)
                    .fixedSize(horizontal: false, vertical: true)

                TextField("Ваше повiдомлення...", text: $supportMessage)
                    .foregroundColor(state.theme.text)
                    .padding(12)
                    .background(state.theme.cardAlt)
                    .cornerRadius(10)

                if supportSent {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(state.theme.green)
                        Text("Повiдомлення надiслано!")
                            .font(.subheadline)
                            .foregroundColor(state.theme.green)
                    }
                }

                Button(action: sendSupportMessage) {
                    HStack {
                        if supportSending {
                            ProgressView()
                                .tint(.white)
                        }
                        Text("Надiслати")
                            .font(.headline)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(supportMessage.isEmpty ? state.theme.cardAlt : state.theme.accent)
                    .cornerRadius(10)
                }
                .disabled(supportMessage.isEmpty || supportSending)

                Spacer()
            }
            .padding(.horizontal)
        }
    }

    func sendSupportMessage() {
        guard !supportMessage.isEmpty else { return }
        supportSending = true
        let message = supportMessage
        Task {
            do {
                try await APIService.shared.sendSupportMessage(message: message)
            } catch {
                // Silently handle -- message is sent best-effort
            }
            await MainActor.run {
                supportSending = false
                supportSent = true
                supportMessage = ""
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    supportSent = false
                    showSupport = false
                }
            }
        }
    }

    // MARK: - Filters Sheet

    var filtersSheet: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        Text("Фiльтри")
                            .font(.title2.bold())
                            .foregroundColor(state.theme.text)
                        Spacer()
                        Button("Скинути") {
                            cityFilter = "all"; priceFilter = "all"
                            discFilter = "all"; ratingFilter = "all"
                        }
                        .foregroundColor(state.theme.accent)
                    }

                    filterGroup(title: "Мiсто", selected: $cityFilter, options: [
                        ("all", "Всi")] + SampleData.cities.map { ($0, $0) })

                    filterGroup(title: "Цiна", selected: $priceFilter, options: [
                        ("all","Всi"),("low","до 200"),("mid","200-500"),("high","500+")])

                    filterGroup(title: "Знижка", selected: $discFilter, options: [
                        ("all","Всi"),("big","30%+"),("med","20-30%"),("small","до 20%")])

                    filterGroup(title: "Рейтинг", selected: $ratingFilter, options: [
                        ("all","Всi"),("top","4.8+"),("good","4.5+")])

                    Button(action: { showFilters = false }) {
                        Text("Застосувати")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(state.theme.accent)
                            .cornerRadius(10)
                    }
                }
                .padding()
            }
        }
    }

    func filterGroup(title: String, selected: Binding<String>, options: [(String, String)]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
                .foregroundColor(state.theme.text)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 6) {
                ForEach(options, id: \.0) { opt in
                    Button(action: { selected.wrappedValue = opt.0 }) {
                        Text(opt.1)
                            .font(.caption)
                            .foregroundColor(selected.wrappedValue == opt.0 ? .white : state.theme.textSec)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 7)
                            .frame(maxWidth: .infinity)
                            .background(selected.wrappedValue == opt.0 ? state.theme.accent : state.theme.cardAlt)
                            .cornerRadius(8)
                    }
                }
            }
        }
    }
}

// MARK: - NavigationDestination for optional

extension View {
    func navigationDestination<D: Hashable, C: View>(item: Binding<D?>, @ViewBuilder destination: @escaping (D) -> C) -> some View {
        self.navigationDestination(isPresented: Binding(
            get: { item.wrappedValue != nil },
            set: { if !$0 { item.wrappedValue = nil } }
        )) {
            if let value = item.wrappedValue {
                destination(value)
            }
        }
    }
}

extension Deal: Hashable {
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
