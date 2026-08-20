# Technical Context: Telegram Bot Framework for Node.js

## Project Type
**TypeScript Library** - Zero-dependency npm package for building Telegram bots

## Core Technology Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Runtime | Node.js 22+ (LTS) | Native fetch, modern APIs, long-term support; also the floor for the built-in `node:sqlite` module used by `SqlitePersistence` |
| Language | TypeScript 5.5+ (strict mode) | Full type safety, PTB-like generics |
| HTTP Client | Native `fetch` | Zero deps, standard, available in Node 18+ |
| Module System | ESM only (`"type": "module"`) | Modern, tree-shakeable, no dual-package hazard |
| Build | `tsc` (declaration + JS) | Standard, no bundler needed for library |
| Testing | `vitest` | Fast, ESM-native, TypeScript support |
| Dev Runner | `tsx` | TypeScript execution without build step |

## Architecture Patterns

### 1. Layered Architecture
```
src/
├── telegram/          # Layer 1: Telegram API types & HTTP client
│   ├── types.ts       # Pure interfaces (User, Message, Update, etc.)
│   ├── bot.ts         # Bot HTTP client (fetch wrapper)
│   └── update.ts      # Update wrapper with convenience getters
├── ext/               # Layer 2: Framework extensions (PTB parity)
│   ├── application.ts # Application, polling, webhook
│   ├── context.ts     # CallbackContext with user_data/chat_data
│   ├── handlers.ts    # All handler classes
│   ├── filters.ts     # Composable filter system
│   ├── conversation.handler.ts # ConversationHandler
│   ├── job.queue.ts   # JobQueue, Job
│   ├── persistence.ts # Persistence interface + implementations
│   └── keyboards.ts   # Keyboard builders
└── utils/             # Layer 3: Internal helpers
    ├── http.ts        # HTTP utilities (multipart, etc.)
    └── validation.ts  # Minimal internal validation
```

### 2. Handler Dispatch Pattern
```
Application.processUpdate(rawUpdate)
  → new Update(rawUpdate, bot)
  → new CallbackContext({ bot, job_queue, user_data, chat_data, bot_data })
  → For each handler group (sorted by priority):
      For each handler in group:
        if await handler.checkUpdate(update):
          await handler.handleUpdate(update, context)
          break (stop at first match in group)
```

### 3. Filter Composition Pattern
```
interface BaseFilter {
  check(message: Message): boolean | Promise<boolean>;
  and(other: BaseFilter): CompositeFilter;
  or(other: BaseFilter): CompositeFilter;
  not(): NegateFilter;
}
```

### 4. Persistence Strategy Pattern
```
interface Persistence {
  getUserData(userId: number): Promise<Record<string, any>>;
  setUserData(userId: number, data: Record<string, any>): Promise<void>;
  getChatData(chatId: number | string): Promise<Record<string, any>>;
  setChatData(chatId: number | string, data: Record<string, any>): Promise<void>;
  getBotData(): Promise<Record<string, any>>;
  setBotData(data: Record<string, any>): Promise<void>;
  getConversations(): Promise<Map<string, number | string>>;
  updateConversation(key: string, state: number | string): Promise<void>;
  getJobs(): Promise<PersistedJob[]>;
  setJobs(jobs: PersistedJob[]): Promise<void>;
}
```

## Key Dependencies

### Production: NONE required (zero required dependencies)
Only Node.js built-in modules:
- `node:http`, `node:https` - Webhook server
- `node:fs`, `node:path` - File persistence
- `node:crypto` - Webhook secret validation
- `node:events` - EventEmitter for JobQueue
- `node:util` - Utility functions
- `node:sqlite` - `SqlitePersistence` (requires Node.js 22.5+, hence the Node 22+ floor above)

### Optional Peer Dependency
- `pino` - only loaded if the developer opts into structured logging (Library Decisions in spec.md); the framework has no dependency on it otherwise, and it is not counted in the "zero required dependencies" guarantee or Success Criteria #4.

### Development Only
```json
{
  "devDependencies": {
    "typescript": "^5.5.0",
    "tsx": "^4.19.0",
    "vitest": "^2.0.0",
    "@types/node": "^22.0.0",
    "typedoc": "^0.28.0"
  }
}
```

Doc generation: `npx typedoc` reads TSDoc/JSDoc comments straight from `src/` (default entry points come from `package.json`'s `exports`/`main`) — see NFR-4 in spec.md for the required tag set (`@param`, `@returns`, `@example`, `@throws`, `@defaultValue`, `@remarks`, `@deprecated`).

## Data Models

### Core Entities (from Telegram Bot API 8.0)

```
User
├── id: number
├── is_bot: boolean
├── first_name: string
├── last_name?: string
├── username?: string
├── language_code?: string
├── is_premium?: boolean
├── added_to_attachment_menu?: boolean
└── can_join_groups?, can_read_all_group_messages?, supports_inline_queries?

Chat
├── id: number | string
├── type: "private" | "group" | "supergroup" | "channel"
├── title?: string
├── username?: string
├── first_name?, last_name?
├── photo?: ChatPhoto
├── active_usernames?: string[]
├── bio?, description?
├── invite_link?
├── pinned_message?: Message
├── permissions?: ChatPermissions
├── slow_mode_delay?
├── message_auto_delete_time?
├── has_aggressive_anti_spam_enabled?
├── has_hidden_members?
├── has_protected_content?
├── has_visible_history?
├── sticker_set_name?
├── can_set_sticker_set?
├── linked_chat_id?
├── location?: ChatLocation
└── ... (all Bot API 8.0 fields)

Message
├── message_id: number
├── message_thread_id?: number
├── from?: User
├── sender_chat?: Chat
├── date: number
├── chat: Chat
├── forward_origin?: MessageOrigin
├── is_topic_message?: boolean
├── is_automatic_forward?: boolean
├── reply_to_message?: Message
├── external_reply?: ExternalReplyInfo
├── quote?: TextQuote
├── reply_to_story?: Story
├── via_bot?: User
├── edit_date?: number
├── has_protected_content?: boolean
├── is_from_offline?: boolean
├── media_group_id?: string
├── author_signature?: string
├── text?: string
├── entities?: MessageEntity[]
├── caption?: string
├── caption_entities?: MessageEntity[]
├── has_media_spoiler?: boolean
├── contact?: Contact
├── dice?: Dice
├── game?: Game
├── poll?: Poll
├── venue?: Venue
├── location?: Location
├── new_chat_members?: User[]
├── left_chat_member?: User
├── new_chat_title?: string
├── new_chat_photo?: PhotoSize[]
├── delete_chat_photo?: boolean
├── group_chat_created?: boolean
├── supergroup_chat_created?: boolean
├── channel_chat_created?: boolean
├── message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged
├── migrate_to_chat_id?: number
├── migrate_from_chat_id?: number
├── pinned_message?: Message
├── invoice?: Invoice
├── successful_payment?: SuccessfulPayment
├── refunded_payment?: RefundedPayment
├── users_shared?: UsersShared
├── chat_shared?: ChatShared
├── connected_website?: string
├── write_access_allowed?: WriteAccessAllowed
├── passport_data?: PassportData
├── proximity_alert_triggered?: ProximityAlertTriggered
├── boost_added?: ChatBoostAdded
├── chat_background_set?: ChatBackground
├── forum_topic_created?: ForumTopicCreated
├── forum_topic_edited?: ForumTopicEdited
├── forum_topic_closed?: ForumTopicClosed
├── forum_topic_reopened?: ForumTopicReopened
├── general_forum_topic_hidden?: GeneralForumTopicHidden
├── general_forum_topic_unhidden?: GeneralForumTopicUnhidden
├── giveaway_created?: GiveawayCreated
├── giveaway?: Giveaway
├── giveaway_winners?: GiveawayWinners
├── giveaway_completed?: GiveawayCompleted
├── video_chat_scheduled?: VideoChatScheduled
├── video_chat_started?: VideoChatStarted
├── video_chat_ended?: VideoChatEnded
├── video_chat_participants_invited?: VideoChatParticipantsInvited
├── web_app_data?: WebAppData
├── reply_markup?: InlineKeyboardMarkup
└── ... (all Bot API 8.0 fields)

Update
├── update_id: number
├── message?: Message
├── edited_message?: Message
├── channel_post?: Message
├── edited_channel_post?: Message
├── inline_query?: InlineQuery
├── chosen_inline_result?: ChosenInlineResult
├── callback_query?: CallbackQuery
├── shipping_query?: ShippingQuery
├── pre_checkout_query?: PreCheckoutQuery
├── poll?: Poll
├── poll_answer?: PollAnswer
├── my_chat_member?: ChatMemberUpdated
├── chat_member?: ChatMemberUpdated
├── chat_join_request?: ChatJoinRequest
├── chat_boost?: ChatBoostUpdated
├── removed_chat_boost?: ChatBoostRemoved
├── business_connection?: BusinessConnection
├── business_message?: Message
├── edited_business_message?: Message
├── deleted_business_messages?: BusinessMessagesDeleted
└── reaction?: MessageReactionUpdated
    reaction_count?: MessageReactionCountUpdated
```

### Framework Entities

```
Application
├── bot: Bot
├── job_queue: JobQueue
├── handlers: Map<number, BaseHandler[]>  # group → handlers
├── errorHandlers: ErrorHandlerCallback[]
├── user_data: Map<number, Record<string, any>>
├── chat_data: Map<number|string, Record<string, any>>
├── bot_data: Record<string, any>
├── offset: number
├── isRunning: boolean
└── webhookServer?: http.Server

CallbackContext<UserData, ChatData, BotData>
├── bot: Bot
├── job_queue?: JobQueue
├── job?: Job
├── args?: string[]
├── user_data?: UserData
├── chat_data?: ChatData
├── bot_data?: BotData
├── error?: Error
├── matches?: RegExpMatchArray[]

BaseHandler (abstract)
├── abstract checkUpdate(update: Update): boolean | Promise<boolean>
└── abstract handleUpdate(update: Update, context: CallbackContext): Promise<any>

Job
├── callback: (context: CallbackContext) => Promise<void>
├── data?: any
├── name?: string
├── nextRun: number
├── interval?: number
├── removed: boolean
└── remove(): void

JobQueue
├── jobs: Set<Job>
├── running: boolean
└── timer?: NodeJS.Timeout

PersistedJob                        # serializable subset of Job, written by Persistence.setJobs()
├── name: string
├── nextRun: number
├── interval?: number
└── data?: any                      # callback itself is not serialized; re-attached by name on load
```

## API Contracts

### Bot Methods (subset - all Bot API 8.0 methods)
```
getMe(): Promise<User>
getUpdates(options?: GetUpdatesOptions): Promise<Update[]>
setWebhook(options: SetWebhookOptions): Promise<boolean>
deleteWebhook(dropPendingUpdates?: boolean): Promise<boolean>
getWebhookInfo(): Promise<WebhookInfo>
sendMessage(options: SendMessageOptions): Promise<Message>
editMessageText(options: EditMessageTextOptions): Promise<Message | boolean>
deleteMessage(chatId: number|string, messageId: number): Promise<boolean>
answerCallbackQuery(options: AnswerCallbackQueryOptions): Promise<boolean>
sendPhoto(options: SendPhotoOptions): Promise<Message>
sendDocument(options: SendDocumentOptions): Promise<Message>
sendAudio(options: SendAudioOptions): Promise<Message>
sendVideo(options: SendVideoOptions): Promise<Message>
sendAnimation(options: SendAnimationOptions): Promise<Message>
sendVoice(options: SendVoiceOptions): Promise<Message>
sendVideoNote(options: SendVideoNoteOptions): Promise<Message>
sendMediaGroup(options: SendMediaGroupOptions): Promise<Message[]>
sendLocation(options: SendLocationOptions): Promise<Message>
sendVenue(options: SendVenueOptions): Promise<Message>
sendContact(options: SendContactOptions): Promise<Message>
sendPoll(options: SendPollOptions): Promise<Message>
sendDice(options: SendDiceOptions): Promise<Message>
sendChatAction(options: SendChatActionOptions): Promise<boolean>
getUserProfilePhotos(userId: number, offset?: number, limit?: number): Promise<UserProfilePhotos>
getFile(fileId: string): Promise<File>
banChatMember(chatId: number|string, userId: number, untilDate?: number): Promise<boolean>
unbanChatMember(chatId: number|string, userId: number): Promise<boolean>
restrictChatMember(chatId: number|string, userId: number, permissions: ChatPermissions, untilDate?: number): Promise<boolean>
promoteChatMember(chatId: number|string, userId: number, options: PromoteChatMemberOptions): Promise<boolean>
setChatAdministratorCustomTitle(chatId: number|string, userId: number, customTitle: string): Promise<boolean>
setChatPermissions(chatId: number|string, permissions: ChatPermissions): Promise<boolean>
exportChatInviteLink(chatId: number|string): Promise<string>
createChatInviteLink(chatId: number|string, options?: CreateChatInviteLinkOptions): Promise<ChatInviteLink>
editChatInviteLink(chatId: number|string, inviteLink: string, options?: EditChatInviteLinkOptions): Promise<ChatInviteLink>
revokeChatInviteLink(chatId: number|string, inviteLink: string): Promise<boolean>
approveChatJoinRequest(chatId: number|string, userId: number): Promise<boolean>
declineChatJoinRequest(chatId: number|string, userId: number): Promise<boolean>
setChatPhoto(chatId: number|string, photo: InputFile): Promise<boolean>
deleteChatPhoto(chatId: number|string): Promise<boolean>
setChatTitle(chatId: number|string, title: string): Promise<boolean>
setChatDescription(chatId: number|string, description?: string): Promise<boolean>
pinChatMessage(chatId: number|string, messageId: number, disableNotification?: boolean): Promise<boolean>
unpinChatMessage(chatId: number|string, messageId?: number): Promise<boolean>
unpinAllChatMessages(chatId: number|string): Promise<boolean>
leaveChat(chatId: number|string): Promise<boolean>
getChat(chatId: number|string): Promise<Chat>
getChatAdministrators(chatId: number|string): Promise<ChatMember[]>
getChatMemberCount(chatId: number|string): Promise<number>
getChatMember(chatId: number|string, userId: number): Promise<ChatMember>
setChatStickerSet(chatId: number|string, stickerSetName: string): Promise<boolean>
deleteChatStickerSet(chatId: number|string): Promise<boolean>
answerInlineQuery(options: AnswerInlineQueryOptions): Promise<boolean>
answerWebAppQuery(webAppQueryId: string, result: InlineQueryResult): Promise<SentWebAppMessage>
... (all 80+ Bot API methods)
```

## Configuration

### Environment Variables
```
BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11  # Required
WEBHOOK_URL=https://example.com/webhook              # For webhook mode
WEBHOOK_PORT=8080                                    # Default: 8080
WEBHOOK_PATH=/webhook                                # Default: /webhook
WEBHOOK_SECRET_TOKEN=optional-secret                 # For validation
PERSISTENCE_TYPE=memory|json|sqlite                  # Default: memory
PERSISTENCE_PATH=./data                              # For json/sqlite
LOG_LEVEL=debug|info|warn|error                      # Default: info
```

### Application Options
```
ApplicationOptions {
  persistence?: Persistence;
  jobQueue?: JobQueue;
  updateQueue?: UpdateQueue;
  concurrentUpdates?: boolean;  // Default: true
}
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Cold start (require + build) | < 200ms |
| Handler dispatch latency | < 1ms per update |
| Memory (idle, 1000 chats) | < 50MB |
| Memory (active, 10k updates/min) | < 100MB |
| Polling throughput | > 1000 updates/sec |
| Webhook throughput | > 5000 updates/sec |

## Error Handling Strategy

1. **Network errors**: Exponential backoff (1s, 2s, 4s, 8s, max 30s) on 429/5xx
2. **Handler errors**: Caught → error handlers → logged
3. **Validation errors**: Fail fast with descriptive messages
4. **Unhandled rejections**: Process-level handler logs and continues

## Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | vitest | 80%+ |
| Integration | vitest + test bot token | Key flows |
| E2E | Manual against Telegram | All examples |

## Open Questions (NEEDS CLARIFICATION)

None. Resolved during the 2026-08-20 spec review:
- Minimum Node.js version raised from 20+ to 22+, to get the built-in `node:sqlite` module `SqlitePersistence` needs.
- `Persistence` interface extended with `getJobs()`/`setJobs()`, since FR-7's "persistent jobs" had no storage methods to use.
- "Zero dependencies" clarified to mean zero *required* dependencies; the optional `pino` peer dependency is explicitly excluded from that guarantee and from Success Criteria #4.