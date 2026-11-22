package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func newMockBotServer(t *testing.T, resultJSON string, capturedPath *string, capturedBody *map[string]any) (*bot.Bot, *httptest.Server) {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		*capturedPath = r.URL.Path
		var body map[string]any
		_ = json.NewDecoder(r.Body).Decode(&body)
		*capturedBody = body
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true,"result":` + resultJSON + `}`))
	}))
	b := bot.NewBot("TEST_TOKEN", bot.WithBaseURL(srv.URL))
	return b, srv
}

func TestBotAPI10_4_Methods(t *testing.T) {
	ctx := context.Background()

	t.Run("SendWidget", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `{"message_id":101,"date":1700000000,"chat":{"id":123,"type":"private"},"widget":{"id":"w1","html":"<div>hi</div>"}}`, &path, &body)
		defer srv.Close()

		msg, err := b.SendWidget(ctx, &types.SendWidgetOptions{
			ChatID:       int64(123),
			HTML:         "<div>hi</div>",
			Width:        320,
			Height:       240,
			AllowQueries: true,
		})
		if err != nil {
			t.Fatalf("SendWidget error: %v", err)
		}
		if path != "/botTEST_TOKEN/sendWidget" {
			t.Errorf("unexpected path: %s", path)
		}
		if msg == nil || msg.Widget == nil || msg.Widget.ID != "w1" {
			t.Errorf("unexpected message/widget: %+v", msg)
		}
	})

	t.Run("SendSharedWidget", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `{"message_id":102,"date":1700000000,"chat":{"id":123,"type":"private"}}`, &path, &body)
		defer srv.Close()

		msg, err := b.SendSharedWidget(ctx, &types.SendSharedWidgetOptions{
			ChatID:   int64(123),
			WidgetID: "shared_1",
		})
		if err != nil {
			t.Fatalf("SendSharedWidget error: %v", err)
		}
		if path != "/botTEST_TOKEN/sendSharedWidget" || msg.MessageID != 102 {
			t.Errorf("unexpected result: path=%s msg=%+v", path, msg)
		}
	})

	t.Run("AnswerWidgetQuery", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `true`, &path, &body)
		defer srv.Close()

		ok, err := b.AnswerWidgetQuery(ctx, &types.AnswerWidgetQueryOptions{
			WidgetQueryID: "wq_1",
			Data:          "ok",
		})
		if err != nil || !ok || path != "/botTEST_TOKEN/answerWidgetQuery" {
			t.Fatalf("AnswerWidgetQuery failed: ok=%v err=%v path=%s", ok, err, path)
		}
	})

	t.Run("EditMessageWidgetData", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `true`, &path, &body)
		defer srv.Close()

		ok, err := b.EditMessageWidgetData(ctx, &types.EditMessageWidgetDataOptions{
			ChatID:     int64(123),
			MessageID:  101,
			PublicData: `{"v":1}`,
		})
		if err != nil || !ok || path != "/botTEST_TOKEN/editMessageWidgetData" {
			t.Fatalf("EditMessageWidgetData failed: ok=%v err=%v path=%s", ok, err, path)
		}
	})

	t.Run("EditSharedWidgetData", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `true`, &path, &body)
		defer srv.Close()

		ok, err := b.EditSharedWidgetData(ctx, &types.EditSharedWidgetDataOptions{
			WidgetID:   "shared_1",
			PublicData: `{"v":2}`,
			CacheTime:  60,
		})
		if err != nil || !ok || path != "/botTEST_TOKEN/editSharedWidgetData" {
			t.Fatalf("EditSharedWidgetData failed: ok=%v err=%v path=%s", ok, err, path)
		}
	})

	t.Run("GetChatShareThemeBackdrops", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `{"backdrops":[{"id":1,"name":"Emerald","colors":{"center_color":1,"edge_color":2,"symbol_color":3,"text_color":4}}]}`, &path, &body)
		defer srv.Close()

		res, err := b.GetChatShareThemeBackdrops(ctx)
		if err != nil || res == nil || len(res.Backdrops) != 1 || res.Backdrops[0].Name != "Emerald" {
			t.Fatalf("GetChatShareThemeBackdrops failed: res=%+v err=%v", res, err)
		}
	})

	t.Run("GetUniqueGift", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `{"gift_id":"g1","base_name":"Star","name":"Star-1","number":1}`, &path, &body)
		defer srv.Close()

		gift, err := b.GetUniqueGift(ctx, "Star-1")
		if err != nil || gift == nil || gift.Name != "Star-1" || path != "/botTEST_TOKEN/getUniqueGift" {
			t.Fatalf("GetUniqueGift failed: gift=%+v err=%v path=%s", gift, err, path)
		}
	})

	t.Run("DeleteBusinessAccountGift", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `true`, &path, &body)
		defer srv.Close()

		ok, err := b.DeleteBusinessAccountGift(ctx, "bc_1", "og_1")
		if err != nil || !ok || path != "/botTEST_TOKEN/deleteBusinessAccountGift" {
			t.Fatalf("DeleteBusinessAccountGift failed: ok=%v err=%v path=%s", ok, err, path)
		}
	})

	t.Run("VerifyUserWithOptions", func(t *testing.T) {
		var path string
		var body map[string]any
		b, srv := newMockBotServer(t, `true`, &path, &body)
		defer srv.Close()

		ok, err := b.VerifyUser(ctx, 42, "Verified", &types.VerifyDescriptionOptions{
			CustomDescriptionParseMode: "HTML",
			CustomDescriptionEntities:  []types.MessageEntity{{Type: "bold", Offset: 0, Length: 8}},
		})
		if err != nil || !ok || body["custom_description_parse_mode"] != "HTML" {
			t.Fatalf("VerifyUser with options failed: ok=%v err=%v body=%+v", ok, err, body)
		}
	})
}
