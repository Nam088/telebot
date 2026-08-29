package routing

import "fmt"

// UseNamed registers a middleware under a unique name so plugins can remove
// it later with RemoveMiddleware. Registration order still determines
// execution order.
//
// Parameters:
//   - name: Unique middleware identifier; prefix with your plugin name.
//   - m: Middleware to register.
//
// Returns:
//   - error: Non-nil if a middleware with the same name is already registered.
//
// Example:
//
//	err := router.UseNamed("i18n", i18n.New(opts))
//	if err != nil {
//	    log.Fatal(err)
//	}
func (r *Router) UseNamed(name string, m MiddlewareFunc) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, entry := range r.middlewares {
		if entry.name == name {
			return fmt.Errorf("middleware %q is already registered", name)
		}
	}
	r.middlewares = append(r.middlewares, middlewareEntry{name: name, fn: m})
	return nil
}

// RemoveMiddleware removes the middleware previously registered under the
// given name with UseNamed. Middlewares added through Use are anonymous and
// cannot be removed.
//
// Parameters:
//   - name: Name passed to UseNamed.
//
// Returns:
//   - bool: True if a named middleware was found and removed.
//
// Example:
//
//	if router.RemoveMiddleware("i18n") {
//	    log.Println("i18n plugin detached")
//	}
func (r *Router) RemoveMiddleware(name string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i, entry := range r.middlewares {
		if entry.name == name {
			r.middlewares = append(r.middlewares[:i], r.middlewares[i+1:]...)
			return true
		}
	}
	return false
}
