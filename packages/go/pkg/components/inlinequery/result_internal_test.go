package inlinequery

import "testing"

func TestToResult_MarshalError(t *testing.T) {
	// A cyclic structure cannot be marshaled to JSON, forcing toResult down its
	// error path so it returns nil instead of panicking.
	type cyclic struct {
		Self *cyclic
	}
	c := &cyclic{}
	c.Self = c

	if got := toResult(c); got != nil {
		t.Errorf("expected nil for an unmarshalable input, got %v", got)
	}
}

func TestToResult_NullInput(t *testing.T) {
	// Top-level functions marshal to JSON null, which unmarshals into a nil map.
	if got := toResult(func() {}); got != nil {
		t.Errorf("expected nil map for a null JSON input, got %v", got)
	}
}

func TestToResult_NonObjectInput(t *testing.T) {
	// A slice marshals to a JSON array, which cannot decode into the result
	// map and must trigger the unmarshal error path.
	if got := toResult([]int{1, 2}); got != nil {
		t.Errorf("expected nil for a non-object input, got %v", got)
	}
}
