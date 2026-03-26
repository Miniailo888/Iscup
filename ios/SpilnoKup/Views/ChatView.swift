import SwiftUI

struct ChatListView: View {
    @EnvironmentObject var state: AppState
    @State private var selectedChat: Chat? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(state.chats) { chat in
                            Button(action: { selectedChat = chat }) {
                                chatRow(chat)
                            }
                            .buttonStyle(.plain)
                            Divider()
                                .background(state.theme.border)
                                .padding(.leading, 70)
                        }
                    }
                    .padding(.top, 8)
                }
            }
            .navigationTitle("Повідомлення")
            .sheet(item: $selectedChat) { chat in
                ChatDetailView(chat: chat)
                    .environmentObject(state)
            }
        }
    }

    func chatRow(_ chat: Chat) -> some View {
        HStack(spacing: 12) {
            // Avatar with online indicator
            ZStack(alignment: .bottomTrailing) {
                Text(chat.avatar)
                    .font(.title)
                    .frame(width: 50, height: 50)
                    .background(state.theme.cardAlt)
                    .cornerRadius(25)
                if chat.online {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 12, height: 12)
                        .overlay(Circle().stroke(state.theme.bg, lineWidth: 2))
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(chat.name)
                        .font(.subheadline.bold())
                        .foregroundColor(state.theme.text)
                    Spacer()
                    Text(chat.time)
                        .font(.caption2)
                        .foregroundColor(state.theme.textMuted)
                }
                HStack {
                    Text(chat.last)
                        .font(.caption)
                        .foregroundColor(state.theme.textSec)
                        .lineLimit(1)
                    Spacer()
                    if chat.unread > 0 {
                        Text("\(chat.unread)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 20, height: 20)
                            .background(state.theme.accent)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }
}

extension Chat: Hashable {
    static func == (lhs: Chat, rhs: Chat) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// MARK: - Chat Detail

struct ChatDetailView: View {
    let chat: Chat
    @EnvironmentObject var state: AppState
    @Environment(\.presentationMode) var presentationMode
    @State private var messageText = ""

    var messages: [ChatMessage] {
        state.chatMessages[chat.id] ?? []
    }

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                VStack(spacing: 0) {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 8) {
                                ForEach(messages) { msg in
                                    messageBubble(msg)
                                        .id(msg.id)
                                }
                            }
                            .padding()
                        }
                        .onAppear {
                            if let last = messages.last {
                                proxy.scrollTo(last.id, anchor: .bottom)
                            }
                        }
                        .onChange(of: messages.count) { _ in
                            if let last = messages.last {
                                withAnimation {
                                    proxy.scrollTo(last.id, anchor: .bottom)
                                }
                            }
                        }
                    }

                    // Input bar
                    HStack(spacing: 10) {
                        TextField("Повідомлення...", text: $messageText)
                            .foregroundColor(state.theme.text)
                            .padding(10)
                            .background(state.theme.cardAlt)
                            .cornerRadius(20)

                        Button(action: send) {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title2)
                                .foregroundColor(messageText.isEmpty ? state.theme.textMuted : state.theme.accent)
                        }
                        .disabled(messageText.isEmpty)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(state.theme.card)
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { presentationMode.wrappedValue.dismiss() }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(state.theme.accent)
                    }
                }
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 8) {
                        Text(chat.avatar)
                        VStack(alignment: .leading, spacing: 0) {
                            Text(chat.name)
                                .font(.subheadline.bold())
                                .foregroundColor(state.theme.text)
                            Text(chat.online ? "Онлайн" : "Був(ла) нещодавно")
                                .font(.caption2)
                                .foregroundColor(chat.online ? .green : state.theme.textMuted)
                        }
                    }
                }
            }
        }
    }

    func messageBubble(_ msg: ChatMessage) -> some View {
        HStack {
            if msg.from == .me { Spacer(minLength: 50) }

            VStack(alignment: msg.from == .me ? .trailing : .leading, spacing: 2) {
                Text(msg.text)
                    .font(.subheadline)
                    .foregroundColor(state.theme.text)
                    .lineLimit(nil)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(msg.from == .me ? state.theme.accent.opacity(0.3) : state.theme.cardAlt)
                    .cornerRadius(16)

                Text(msg.time)
                    .font(.system(size: 10))
                    .foregroundColor(state.theme.textMuted)
                    .padding(.horizontal, 4)
            }

            if msg.from == .them { Spacer(minLength: 50) }
        }
    }

    func send() {
        guard !messageText.isEmpty else { return }
        state.sendMessage(chatId: chat.id, text: messageText)
        messageText = ""
    }
}
