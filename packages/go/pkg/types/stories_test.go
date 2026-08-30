package types_test

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestStoryArea_WireShape asserts every StoryAreaType variant serializes with
// the discriminator and snake_case keys node declares in its union, since
// postStory/editStory send areas verbatim in the request body.
func TestStoryArea_WireShape(t *testing.T) {
	position := types.StoryAreaPosition{
		XPercentage:            30.5,
		YPercentage:            70,
		WidthPercentage:        25,
		HeightPercentage:       10.25,
		RotationAngle:          15,
		CornerRadiusPercentage: 20,
	}

	areas := []types.StoryArea{
		{
			Position: position,
			Type: types.StoryAreaTypeLocation{
				Type:     "location",
				Location: types.Location{Latitude: 10.5, Longitude: 20.5},
				Address:  map[string]any{"city": "Hanoi"},
			},
		},
		{
			Position: position,
			Type: types.StoryAreaTypeSuggestedReaction{
				Type:         "suggested_reaction",
				ReactionType: types.ReactionTypeEmoji{Type: "emoji", Emoji: "👍"},
				IsDark:       true,
			},
		},
		{Position: position, Type: types.StoryAreaTypeLink{Type: "link", URL: "https://example.com"}},
		{
			Position: position,
			Type: types.StoryAreaTypeWeather{
				Type:            "weather",
				TemperatureC:    -3.5,
				Emoji:           "🌨",
				BackgroundColor: 0x112233,
			},
		},
	}

	raw, err := json.Marshal(areas)
	if err != nil {
		t.Fatalf("marshal story areas: %v", err)
	}
	body := string(raw)

	wantKeys := []string{
		`"x_percentage":30.5`,
		`"y_percentage":70`,
		`"width_percentage":25`,
		`"height_percentage":10.25`,
		`"rotation_angle":15`,
		`"corner_radius_percentage":20`,
		`"type":"location"`,
		`"latitude":10.5`,
		`"longitude":20.5`,
		`"address":{"city":"Hanoi"}`,
		`"type":"suggested_reaction"`,
		`"reaction_type":{"type":"emoji","emoji":"👍"}`,
		`"is_dark":true`,
		`"type":"link"`,
		`"url":"https://example.com"`,
		`"type":"weather"`,
		`"temperature_c":-3.5`,
		`"background_color":1122867`,
	}
	for _, want := range wantKeys {
		if !strings.Contains(body, want) {
			t.Errorf("serialized areas missing %s\n got %s", want, body)
		}
	}
	if strings.Contains(body, `"is_flipped"`) || strings.Contains(body, `"is_dark":false`) {
		t.Errorf("optional story area flags should be omitted when unset, got %s", body)
	}
}

// TestStoryPosition_DecodesFromWire pins the decode direction of
// StoryAreaPosition, the one story-area model Telegram also sends back on the
// wire.
func TestStoryPosition_DecodesFromWire(t *testing.T) {
	var position types.StoryAreaPosition
	if err := json.Unmarshal([]byte(`{
		"x_percentage": 12.5,
		"y_percentage": 88,
		"width_percentage": 30,
		"height_percentage": 9.5,
		"rotation_angle": 180,
		"corner_radius_percentage": 25
	}`), &position); err != nil {
		t.Fatalf("unmarshal StoryAreaPosition: %v", err)
	}
	if position.XPercentage != 12.5 || position.YPercentage != 88 || position.RotationAngle != 180 {
		t.Errorf("unexpected position: %+v", position)
	}
	if position.WidthPercentage != 30 || position.HeightPercentage != 9.5 || position.CornerRadiusPercentage != 25 {
		t.Errorf("unexpected optional-looking fields: %+v", position)
	}
}

// TestInputStoryContent_WireShape asserts both story content variants serialize
// exactly like node's InputStoryContent union, omitting every optional video
// field that is unset.
func TestInputStoryContent_WireShape(t *testing.T) {
	photo, err := json.Marshal(&types.InputStoryContentPhoto{Type: "photo", Photo: "AGACQADTAAQCAAFY"})
	if err != nil {
		t.Fatalf("marshal photo content: %v", err)
	}
	if string(photo) != `{"type":"photo","photo":"AGACQADTAAQCAAFY"}` {
		t.Errorf("unexpected photo payload: %s", photo)
	}

	video, err := json.Marshal(&types.InputStoryContentVideo{
		Type:      "video",
		Video:     "BAACAgADAgAC8gU0Ax",
		Duration:  8.25,
		Cover:     "AGACABC",
		Timestamp: 1.5,
	})
	if err != nil {
		t.Fatalf("marshal video content: %v", err)
	}
	want := `{"type":"video","video":"BAACAgADAgAC8gU0Ax","duration":8.25,"cover":"AGACABC","timestamp":1.5}`
	if string(video) != want {
		t.Errorf("video payload:\n got %s\nwant %s", video, want)
	}

	// A content value also satisfies the union interface, so callers can pass
	// either variant to the same parameter.
	var content types.InputStoryContent = &types.InputStoryContentPhoto{Type: "photo", Photo: "f1"}
	if content == nil {
		t.Errorf("expected photo content to implement InputStoryContent")
	}
}

// TestEphemeralMessageParameters_WireShape pins the snake_case keys of the
// ephemeral parameters object node embeds in sendLivePhoto and friends.
func TestEphemeralMessageParameters_WireShape(t *testing.T) {
	full, err := json.Marshal(&types.EphemeralMessageParameters{
		ReceiverUserID:              654321,
		CallbackQueryID:             "cq1",
		ReplaceCallbackQueryMessage: true,
	})
	if err != nil {
		t.Fatalf("marshal ephemeral parameters: %v", err)
	}
	want := `{"receiver_user_id":654321,"callback_query_id":"cq1","replace_callback_query_message":true}`
	if string(full) != want {
		t.Errorf("ephemeral parameters:\n got %s\nwant %s", full, want)
	}

	minimal, err := json.Marshal(&types.EphemeralMessageParameters{ReceiverUserID: 654321})
	if err != nil {
		t.Fatalf("marshal minimal ephemeral parameters: %v", err)
	}
	if string(minimal) != `{"receiver_user_id":654321}` {
		t.Errorf("expected optional fields omitted, got %s", minimal)
	}
}
