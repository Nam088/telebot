package types

// AnswerChatJoinRequestQueryOptions represents parameters for the answerChatJoinRequestQuery method.
//
// Telegram API: https://core.telegram.org/bots/api#answerchatjoinrequestquery
type AnswerChatJoinRequestQueryOptions struct {
	// Unique identifier of the chat join request query to be answered.
	ChatJoinRequestQueryID string `json:"chat_join_request_query_id"`
	// An object describing the result of the chat join request interaction,
	// serialized as-is.
	Result any `json:"result"`
}

// SendChatJoinRequestWebAppOptions represents parameters for the sendChatJoinRequestWebApp method.
//
// Telegram API: https://core.telegram.org/bots/api#sendchatjoinrequestwebapp
type SendChatJoinRequestWebAppOptions struct {
	// Unique identifier of the chat join request query.
	ChatJoinRequestQueryID string `json:"chat_join_request_query_id"`
	// An HTTPS URL of the Web App data to be sent.
	WebAppURL string `json:"web_app_url"`
}
