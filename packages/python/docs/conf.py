"""Sphinx configuration for telebot-py (T057, FR-018).

Build with the package installed editable (``pip install -e ".[dev]"``)::

    sphinx-build -W --keep-going docs docs/_build

The ``src`` layout is added to ``sys.path`` as a fallback so autodoc can
import ``telebot_py`` even without the editable install.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

_PACKAGE_ROOT = Path(__file__).resolve().parent.parent
_SRC = _PACKAGE_ROOT / "src"
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))


def _read_version() -> str:
    """Read ``version`` from pyproject.toml so the docs never drift."""
    text = (_PACKAGE_ROOT / "pyproject.toml").read_text(encoding="utf-8")
    match = re.search(r'^version = "([^"]+)"', text, re.MULTILINE)
    return match.group(1) if match else "0.0.0"


project = "telebot-py"
author = "Nam088"
copyright = f"2026, {author}"
version = _read_version()
release = version

extensions = ["sphinx.ext.autodoc", "sphinx.ext.napoleon"]

# The codebase uses Google-style docstrings (Args/Returns/Raises/Example);
# Napoleon converts them to reST so autodoc renders them cleanly.
napoleon_google_docstring = True
napoleon_numpy_docstring = False
# Render Attributes sections as :ivar: fields instead of ``.. attribute::``
# directives: the directives would register every slotted-dataclass field a
# second time (autodoc already documents them) and emit unsuppressible
# "duplicate object description" warnings.
napoleon_use_ivar = True

# Single source of truth for every automodule directive. Each package page
# lists an automodule for the package itself and every submodule, so the
# generated pages cover 100% of the public API surface (FR-018) without
# re-documenting imported names twice.
autodoc_default_options = {
    "members": True,
    "undoc-members": True,
    "show-inheritance": True,
}
# Default: render parameter and return annotations in the signature only.
autodoc_typehints = "signature"


def setup(app: object) -> None:
    """Register the signature post-processor (see _disambiguate_type)."""
    from sphinx.application import Sphinx

    assert isinstance(app, Sphinx)
    app.connect("autodoc-process-signature", _disambiguate_type)


def _disambiguate_type(
    app: object,
    what: str,
    name: str,
    obj: object,
    options: object,
    signature: str | None,
    return_annotation: str | None,
) -> tuple[str | None, str | None] | None:
    """Rewrite the builtin ``type`` in signatures to ``builtins.type``.

    Annotations such as ``cls: type[TObj]`` (telebot_py.bot.base) otherwise
    emit a bare ``:class:`type``` cross-reference that resolves ambiguously
    against the many dataclass attributes named ``type``. Signatures are
    already evaluated at this point, so ``autodoc_type_aliases`` cannot
    intercept them; rewriting the rendered signature is the reliable fix.
    """
    del app, what, name, obj, options  # unused hook arguments
    changed = False
    if signature and "type[" in signature:
        signature = signature.replace("type[", "builtins.type[")
        changed = True
    if return_annotation and "type[" in return_annotation:
        return_annotation = return_annotation.replace("type[", "builtins.type[")
        changed = True
    return (signature, return_annotation) if changed else None

templates_path: list[str] = []
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

html_theme = "alabaster"
html_static_path: list[str] = []
