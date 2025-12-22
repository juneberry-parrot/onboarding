#!/usr/bin/env bash
set -euo pipefail

# Confirmation prompt
echo "This will uninstall the SpecStory wrapper and restore the original specstory binary."
printf "Continue? [y/N]: "
read -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo
echo "Uninstalling SpecStory wrapper..."

# Constants (matching install script)
WRAPPER_DIR="$HOME/.specstory_wrapper"
WRAPPER_BIN="$HOME/bin/specstory"
CLAUDE_WRAPPER_BIN="$HOME/bin/claude"
PATH_EXPORT='export PATH="$HOME/bin:$PATH"'

# Helper to remove lines from profiles
remove_from_profile() {
    local profile="$1"
    local pattern="$2"
    if [[ -f "$profile" ]]; then
        # Use grep -F for fixed strings when pattern doesn't start with ^
        local grep_opts="-v"
        if [[ "$pattern" != ^* ]]; then
            grep_opts="-vF"
        fi
        if grep -q ${grep_opts#-v} "$pattern" "$profile" 2>/dev/null; then
            echo "➡ Cleaning up $profile (removing: $pattern)..."
            # Use temp file for compatibility across Linux/macOS
            if grep $grep_opts "$pattern" "$profile" > "${profile}.tmp" 2>/dev/null; then
                mv "${profile}.tmp" "$profile"
            else
                # grep returns 1 if no lines match (all lines matched pattern)
                # In this case, leave an empty file
                : > "$profile"
            fi
            rm -f "${profile}.tmp" 2>/dev/null || true
        fi
    fi
}

# Helper to check if a file is a wrapper
is_wrapper() {
    local file="$1"
    [[ ! -f "$file" ]] && return 1
    # Check for signature
    grep -q "specstory_wrapper.py" "$file" 2>/dev/null && return 0
    return 1
}

# 1. Remove wrapper binaries (only wrappers we created, not specstory-real)
for bin in "$WRAPPER_BIN" "$CLAUDE_WRAPPER_BIN"; do
    if [[ ! -f "$bin" ]]; then
        continue
    fi
    if is_wrapper "$bin"; then
        echo "➡ Removing wrapper: $bin"
        rm -f "$bin"
    elif [[ "$bin" == "$CLAUDE_WRAPPER_BIN" ]]; then
        # Always remove the claude wrapper we created (it calls specstory run claude)
        if grep -q "specstory run claude" "$bin" 2>/dev/null; then
            echo "➡ Removing $bin"
            rm -f "$bin"
        fi
    fi
done

# 2. Remove wrapper folder
if [[ -d "$WRAPPER_DIR" ]]; then
    echo "➡ Removing $WRAPPER_DIR"
    rm -rf "$WRAPPER_DIR"
fi

# 3. Clean up shell profiles
for profile in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.profile"; do
    [[ ! -f "$profile" ]] && continue

    # Remove PATH export (use fixed strings to avoid escaping issues)
    remove_from_profile "$profile" 'export PATH="\$HOME/bin:\$PATH"'
    remove_from_profile "$profile" 'PATH="\$HOME/bin:\$PATH"'
    
    # Remove aliases
    remove_from_profile "$profile" "^alias claude="
    
    # Remove functions (simple check for the common one added)
    if [[ -f "$profile" ]] && grep -q "claude() {" "$profile"; then
        echo "➡ Removing claude() function from $profile"
        # Remove function block (heuristic)
        # macOS sed requires backup extension, Linux doesn't - use empty string for macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' '/claude() {/,/}/d' "$profile" 2>/dev/null || true
        else
            sed -i '/claude() {/,/}/d' "$profile" 2>/dev/null || true
        fi
    fi

    # Remove SPECSTORY HOOK sections (from venv patching)
    if [[ -f "$profile" ]]; then
        # macOS sed requires backup extension, Linux doesn't - use empty string for macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' \
                -e '/# SPECSTORY HOOK START/,/# SPECSTORY HOOK END/d' \
                -e '/# SPECSTORY DEACTIVATE HOOK/,/unalias claude/d' \
                -e '/# SPECSTORY DEACTIVATE HOOK/,/unset -f claude/d' \
                "$profile" 2>/dev/null || true
        else
            sed -i \
                -e '/# SPECSTORY HOOK START/,/# SPECSTORY HOOK END/d' \
                -e '/# SPECSTORY DEACTIVATE HOOK/,/unalias claude/d' \
                -e '/# SPECSTORY DEACTIVATE HOOK/,/unset -f claude/d' \
                "$profile" 2>/dev/null || true
        fi
    fi
done

# 4. Remove conda activation hooks
if command -v conda >/dev/null 2>&1; then
    while IFS= read -r ENV_PATH; do
        [[ -z "$ENV_PATH" ]] && continue
        for hook in "$ENV_PATH/etc/conda/activate.d/specstory.sh" "$ENV_PATH/etc/conda/deactivate.d/specstory.sh"; do
            if [[ -f "$hook" ]]; then
                echo "➡ Removing conda hook: $hook"
                rm -f "$hook"
            fi
        done
    done < <(conda env list 2>/dev/null | awk 'NR>2 && NF {print $NF}')
fi

# 5. Restore original specstory binary
RESTORED=false
CANDIDATES=(
    "/usr/local/bin/specstory-real"
    "/opt/homebrew/bin/specstory-real"
    "/usr/bin/specstory-real"
    "$HOME/bin/specstory-real"
)

for real in "${CANDIDATES[@]}"; do
    if [[ -f "$real" ]] && ! is_wrapper "$real"; then
        base_dir="$(dirname "$real")"
        target="$base_dir/specstory"
        
        # If target is a wrapper or symlink, replace it
        if [[ ! -f "$target" ]] || [[ -L "$target" ]] || is_wrapper "$target"; then
            echo "➡ Restoring $real → $target"
            [[ -f "$target" || -L "$target" ]] && rm -f "$target"
            mv "$real" "$target" 2>/dev/null || {
                echo "⚠ Could not restore to $target (try running with sudo)"
                echo "  Original binary is at $real"
            }
            RESTORED=true
        else
            # If target already exists and is a real binary, just remove the -real leftover
            echo "✔ Original binary already at $target. Removing leftover $real"
            rm -f "$real"
            RESTORED=true
        fi
    fi
done

if ! $RESTORED; then
    # Check if the binary at the expected location is already the real one
    if [[ -f "/usr/local/bin/specstory" ]] && ! is_wrapper "/usr/local/bin/specstory"; then
        echo "✔ Original specstory binary is already in place at /usr/local/bin/specstory"
    else
        echo "⚠ Could not verify original specstory binary location."
    fi
fi

echo
echo "Uninstall complete!"
echo "═══════════════════════════════════════════════════════════════"
echo "IMPORTANT: To fix your CURRENT terminal session, run:"
echo
echo "  unalias claude 2>/dev/null; unset -f claude 2>/dev/null; hash -r"
echo
echo "═══════════════════════════════════════════════════════════════"
echo "New terminal sessions will work automatically."
echo
