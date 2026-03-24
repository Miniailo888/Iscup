import SwiftUI

struct DealCardView: View {
    let deal: Deal
    let onTap: () -> Void
    @EnvironmentObject var state: AppState

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 0) {
                // Photo area
                ZStack(alignment: .topTrailing) {
                    categoryGradient(for: deal.cat)
                        .frame(height: 90)
                        .overlay(
                            Text(deal.avatar)
                                .font(.system(size: 40))
                        )

                    // Badges
                    VStack(alignment: .trailing, spacing: 4) {
                        if deal.hot {
                            BadgeView(text: "🔥 HOT", bg: Color.red.opacity(0.8), fg: .white, fontSize: 10)
                        }
                        if state.isJoined(deal.id) {
                            BadgeView(text: "✓ Ви", bg: state.theme.accent.opacity(0.8), fg: .white, fontSize: 10)
                        }
                    }
                    .padding(8)

                    // Price overlay
                    VStack {
                        Spacer()
                        HStack {
                            HStack(spacing: 4) {
                                Text("₴\(deal.group)")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(.white)
                                Text("₴\(deal.retail)")
                                    .font(.system(size: 10))
                                    .foregroundColor(.white.opacity(0.5))
                                    .strikethrough()
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.black.opacity(0.6))
                            .cornerRadius(8)
                            Spacer()
                        }
                        .padding(8)
                    }
                }
                .clipShape(RoundedCorner(radius: 16, corners: [.topLeft, .topRight]))

                // Content
                VStack(alignment: .leading, spacing: 8) {
                    Text(deal.title)
                        .font(.subheadline.bold())
                        .foregroundColor(state.theme.text)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)

                    HStack(spacing: 6) {
                        Text(deal.avatar)
                            .font(.caption)
                        Text(deal.seller)
                            .font(.caption)
                            .foregroundColor(state.theme.textSec)
                        Spacer()
                        HStack(spacing: 2) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 9))
                                .foregroundColor(state.theme.yellow)
                            Text(String(format: "%.1f", deal.rating))
                                .font(.caption2)
                                .foregroundColor(state.theme.textSec)
                        }
                    }

                    HStack(spacing: 4) {
                        Image(systemName: "mappin")
                            .font(.system(size: 9))
                            .foregroundColor(state.theme.textMuted)
                        Text(deal.city)
                            .font(.caption2)
                            .foregroundColor(state.theme.textMuted)
                        Spacer()
                        Text("\(deal.days) дн.")
                            .font(.caption2)
                            .foregroundColor(state.theme.orange)
                    }

                    // Progress
                    VStack(spacing: 4) {
                        DealProgressBar(
                            value: deal.pct,
                            color: priceColor(for: deal.pct)
                        )
                        HStack {
                            Text("\(deal.joined)/\(deal.needed)")
                                .font(.system(size: 10))
                                .foregroundColor(state.theme.textSec)
                            Spacer()
                            Text("\(deal.pct)%")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(priceColor(for: deal.pct))
                        }
                    }

                    // Tags
                    HStack(spacing: 4) {
                        ForEach(deal.tags.prefix(2), id: \.self) { tag in
                            Text(tag)
                                .font(.system(size: 9))
                                .foregroundColor(state.theme.green)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(state.theme.greenLight)
                                .cornerRadius(4)
                        }
                        Spacer()

                        // Join button
                        Button(action: {
                            if !state.isJoined(deal.id) {
                                state.joinDeal(deal.id)
                            }
                        }) {
                            Text(state.isJoined(deal.id) ? "✓" : "+")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 32, height: 32)
                                .background(state.isJoined(deal.id) ? state.theme.green : state.theme.accent)
                                .clipShape(Circle())
                        }
                    }
                }
                .padding(12)
                .background(state.theme.card)
            }
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(discountBorderColor(for: deal.disc).opacity(0.4), lineWidth: deal.disc >= 20 ? 1 : 0)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(state.theme.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Rounded Corner helper

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
