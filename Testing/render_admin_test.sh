#!/bin/bash

# ============================================================
# RENDER BACKEND - ADMIN ACCESS SECURITY TEST
# ============================================================
#
# This script tests your Render backend directly.
#
# It checks whether:
#
#   INVALID / NO AUTH
#       -> gets rejected (401/403)
#
#   VALID ADMIN AUTH
#       -> gets access (normally 200)
#
# IMPORTANT:
#   This script DOES NOT save or print response bodies.
#   It only records HTTP status, content type and response size.
#
# ============================================================


# ============================================================
# CONFIGURATION
# ============================================================

BACKEND="https://designer-sona.onrender.com"

# ------------------------------------------------------------
# Put your REAL admin cookie here through the environment:
#
# export VALID_ADMIN_COOKIE='session=YOUR_REAL_COOKIE'
#
# Example:
# export VALID_ADMIN_COOKIE='session=abc123...'
#
# Do NOT put the real cookie directly into this file.
# ------------------------------------------------------------

OUT="render-admin-security-results"
SUMMARY="$OUT/SUMMARY.txt"

mkdir -p "$OUT"


# ============================================================
# ADMIN ENDPOINTS
# ============================================================
#
# IMPORTANT:
# Replace these paths with the ACTUAL routes from your backend.
#
# Examples:
#
# /api/admin/users
# /api/admin/products
#
# If your backend uses different paths, change them here.
#
# ============================================================

declare -A ENDPOINTS

ENDPOINTS["Dashboard"]="/api/admin/dashboard"
ENDPOINTS["Products"]="/api/products/admin/all"
ENDPOINTS["Categories"]="/api/categories/admin"
ENDPOINTS["Portfolio"]="/api/portfolio/admin/all"
ENDPOINTS["Orders"]="/api/orders/admin/all"
ENDPOINTS["Inquiries"]="/api/contact/admin/all"
ENDPOINTS["Custom Requests"]="/api/custom-design/admin/all"
ENDPOINTS["Settings"]="/api/settings"


# ============================================================
# COUNTERS
# ============================================================

TOTAL=0
PASS=0
FAIL=0
REVIEW=0
NOT_FOUND=0
CURL_ERROR=0


# ============================================================
# HEADER
# ============================================================

echo
echo "============================================================"
echo "        RENDER BACKEND ADMIN SECURITY TEST"
echo "============================================================"
echo "Backend: $BACKEND"
echo "Date:    $(date)"
echo "============================================================"
echo


# ============================================================
# COOKIE CHECK
# ============================================================

if [ -z "$VALID_ADMIN_COOKIE" ]; then

    echo
    echo "[WARNING] VALID_ADMIN_COOKIE is not set."
    echo
    echo "Valid-admin tests will be skipped."
    echo
    echo "Set it with:"
    echo
    echo "export VALID_ADMIN_COOKIE='session=YOUR_REAL_COOKIE'"
    echo

else

    echo "[OK] Valid admin cookie is configured."
    echo

fi


# ============================================================
# SUMMARY HEADER
# ============================================================

{
    echo "============================================================"
    echo "        RENDER BACKEND ADMIN SECURITY TEST"
    echo "============================================================"
    echo "Backend: $BACKEND"
    echo "Date:    $(date)"
    echo "============================================================"
    echo
} > "$SUMMARY"


# ============================================================
# RUN REQUEST
# ============================================================
#
# IMPORTANT:
# Response body is redirected to /dev/null.
#
# Therefore admin data is NEVER printed or stored.
#
# ============================================================

run_request() {

    local NAME="$1"
    local URL="$2"
    local TYPE="$3"
    local COOKIE="$4"

    TOTAL=$((TOTAL + 1))

    local HEADERS
    local STATUS
    local SIZE
    local CONTENT_TYPE
    local CURL_EXIT
    local RESULT

    HEADERS=$(mktemp)

    if [ "$TYPE" = "NO_AUTH" ]; then

        STATUS=$(
            curl -sS \
                --max-time 30 \
                -D "$HEADERS" \
                -o /dev/null \
                -w "%{http_code}" \
                -H "Accept: application/json" \
                "$URL" \
                2>/dev/null
        )

        CURL_EXIT=$?

    else

        STATUS=$(
            curl -sS \
                --max-time 30 \
                -D "$HEADERS" \
                -o /dev/null \
                -w "%{http_code}" \
                -H "Accept: application/json" \
                -H "Cookie: $COOKIE" \
                "$URL" \
                2>/dev/null
        )

        CURL_EXIT=$?

    fi


    # --------------------------------------------------------
    # CURL ERROR
    # --------------------------------------------------------

    if [ "$CURL_EXIT" -ne 0 ]; then

        STATUS="CURL_ERROR"
        RESULT="CURL_ERROR"

        CURL_ERROR=$((CURL_ERROR + 1))

        echo "[CURL ERROR] $TYPE - $NAME"

        {
            echo "[$TYPE] $NAME"
            echo "URL: $URL"
            echo "STATUS: CURL_ERROR"
            echo
        } >> "$SUMMARY"

        rm -f "$HEADERS"

        return

    fi


    # --------------------------------------------------------
    # RESPONSE SIZE
    # --------------------------------------------------------

    SIZE=$(
        curl -sS \
            --max-time 30 \
            -o /dev/null \
            -w "%{size_download}" \
            -H "Accept: application/json" \
            ${COOKIE:+-H "Cookie: $COOKIE"} \
            "$URL" \
            2>/dev/null
    )


    # --------------------------------------------------------
    # CONTENT TYPE
    # --------------------------------------------------------

    CONTENT_TYPE=$(
        awk -F': ' '
            BEGIN {IGNORECASE=1}
            /^content-type:/ {
                gsub("\r", "", $2)
                print $2
                exit
            }
        ' "$HEADERS"
    )


    # --------------------------------------------------------
    # DETERMINE RESULT
    # --------------------------------------------------------

    if [ "$TYPE" = "NO_AUTH" ] || [ "$TYPE" = "FAKE_AUTH" ]; then

        case "$STATUS" in

            401|403)
                RESULT="PASS"
                PASS=$((PASS + 1))
                ;;

            404)
                RESULT="NOT_FOUND"
                NOT_FOUND=$((NOT_FOUND + 1))
                ;;

            200|201|202|204)
                RESULT="FAIL"
                FAIL=$((FAIL + 1))
                ;;

            *)
                RESULT="REVIEW"
                REVIEW=$((REVIEW + 1))
                ;;

        esac

    else

        # ----------------------------------------------------
        # VALID ADMIN
        # ----------------------------------------------------

        case "$STATUS" in

            200|201|202|204)
                RESULT="PASS"
                PASS=$((PASS + 1))
                ;;

            401|403)
                RESULT="FAIL"
                FAIL=$((FAIL + 1))
                ;;

            404)
                RESULT="NOT_FOUND"
                NOT_FOUND=$((NOT_FOUND + 1))
                ;;

            *)
                RESULT="REVIEW"
                REVIEW=$((REVIEW + 1))
                ;;

        esac

    fi


    # --------------------------------------------------------
    # PRINT RESULT
    # --------------------------------------------------------

    case "$RESULT" in

        PASS)
            echo "[PASS] $TYPE - $NAME -> HTTP $STATUS | ${SIZE} bytes | ${CONTENT_TYPE}"
            ;;

        FAIL)
            echo "[FAIL] $TYPE - $NAME -> HTTP $STATUS | ${SIZE} bytes | ${CONTENT_TYPE}"
            ;;

        NOT_FOUND)
            echo "[ROUTE NOT FOUND] $TYPE - $NAME -> HTTP $STATUS"
            ;;

        *)
            echo "[REVIEW] $TYPE - $NAME -> HTTP $STATUS | ${SIZE} bytes | ${CONTENT_TYPE}"
            ;;

    esac


    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    {
        echo "------------------------------------------------------------"
        echo "TEST: $TYPE - $NAME"
        echo "URL: $URL"
        echo "HTTP STATUS: $STATUS"
        echo "RESULT: $RESULT"
        echo "RESPONSE SIZE: ${SIZE:-unknown} bytes"
        echo "CONTENT TYPE: ${CONTENT_TYPE:-unknown}"
        echo "------------------------------------------------------------"
        echo
    } >> "$SUMMARY"


    rm -f "$HEADERS"
}


# ============================================================
# NO AUTHENTICATION
# ============================================================

echo
echo "============================================================"
echo " 1. NO AUTHENTICATION"
echo "============================================================"
echo

for NAME in "${!ENDPOINTS[@]}"; do

    ENDPOINT="${ENDPOINTS[$NAME]}"
    URL="$BACKEND$ENDPOINT"

    run_request \
        "$NAME" \
        "$URL" \
        "NO_AUTH" \
        ""

done


# ============================================================
# FAKE AUTHENTICATION
# ============================================================

echo
echo "============================================================"
echo " 2. FAKE AUTHENTICATION"
echo "============================================================"
echo

for NAME in "${!ENDPOINTS[@]}"; do

    ENDPOINT="${ENDPOINTS[$NAME]}"
    URL="$BACKEND$ENDPOINT"

    run_request \
        "$NAME" \
        "$URL" \
        "FAKE_AUTH" \
        "session=fake-invalid-cookie-value"

done


# ============================================================
# VALID ADMIN AUTHENTICATION
# ============================================================

if [ -n "$VALID_ADMIN_COOKIE" ]; then

    echo
    echo "============================================================"
    echo " 3. VALID ADMIN AUTHENTICATION"
    echo "============================================================"
    echo

    for NAME in "${!ENDPOINTS[@]}"; do

        ENDPOINT="${ENDPOINTS[$NAME]}"
        URL="$BACKEND$ENDPOINT"

        run_request \
            "$NAME" \
            "$URL" \
            "VALID_ADMIN" \
            "$VALID_ADMIN_COOKIE"

    done

else

    echo
    echo "============================================================"
    echo " 3. VALID ADMIN AUTHENTICATION"
    echo "============================================================"
    echo
    echo "[SKIPPED] VALID_ADMIN_COOKIE is not configured."
    echo

fi


# ============================================================
# FINAL REPORT
# ============================================================

echo
echo "============================================================"
echo "                    FINAL REPORT"
echo "============================================================"
echo
echo "TOTAL TESTS:      $TOTAL"
echo "PASSED:           $PASS"
echo "FAILED:           $FAIL"
echo "REVIEW:           $REVIEW"
echo "ROUTES NOT FOUND: $NOT_FOUND"
echo "CURL ERRORS:      $CURL_ERROR"
echo


{
    echo
    echo "============================================================"
    echo "                    FINAL REPORT"
    echo "============================================================"
    echo
    echo "TOTAL TESTS:      $TOTAL"
    echo "PASSED:           $PASS"
    echo "FAILED:           $FAIL"
    echo "REVIEW:           $REVIEW"
    echo "ROUTES NOT FOUND: $NOT_FOUND"
    echo "CURL ERRORS:      $CURL_ERROR"
    echo
} >> "$SUMMARY"


# ============================================================
# OVERALL RESULT
# ============================================================

if [ "$FAIL" -gt 0 ]; then

    echo "============================================================"
    echo " RESULT: ❌ SECURITY FAILURE"
    echo "============================================================"
    echo
    echo "At least one protected endpoint accepted unauthorized access."

    echo "RESULT: SECURITY FAILURE" >> "$SUMMARY"


elif [ "$CURL_ERROR" -gt 0 ]; then

    echo "============================================================"
    echo " RESULT: ⚠️ CONNECTION ERROR"
    echo "============================================================"
    echo
    echo "Some requests could not be completed."

    echo "RESULT: CONNECTION ERROR" >> "$SUMMARY"


elif [ "$NOT_FOUND" -gt 0 ]; then

    echo "============================================================"
    echo " RESULT: ⚠️ ROUTES NEED VERIFICATION"
    echo "============================================================"
    echo
    echo "Some configured endpoints returned 404."
    echo
    echo "Check the ENDPOINTS section of this script."
    echo
    echo "The security result cannot be confirmed until"
    echo "the actual Render API routes are used."

    echo "RESULT: ROUTES NEED VERIFICATION" >> "$SUMMARY"


elif [ "$PASS" -gt 0 ]; then

    echo "============================================================"
    echo " RESULT: ✅ AUTHENTICATION TEST PASSED"
    echo "============================================================"
    echo
    echo "Unauthorized requests were rejected and"
    echo "authorized requests were accepted."

    echo "RESULT: AUTHENTICATION TEST PASSED" >> "$SUMMARY"


else

    echo "============================================================"
    echo " RESULT: ⚠️ NOT TESTED"
    echo "============================================================"
    echo
    echo "No confirmed security result was produced."

    echo "RESULT: NOT TESTED" >> "$SUMMARY"

fi


# ============================================================
# OUTPUT
# ============================================================

echo
echo "============================================================"
echo " RESULTS"
echo "============================================================"
echo
echo "Report:"
echo "$SUMMARY"
echo
echo "IMPORTANT:"
echo "No admin response bodies were saved or displayed."
echo


# ============================================================
# 10 SECOND COUNTDOWN
# ============================================================

echo "============================================================"
echo " Test complete."
echo " Terminal will close/return in 10 seconds..."
echo "============================================================"

for i in {10..1}; do
    echo -ne "\rExiting in ${i} seconds... "
    sleep 1
done

echo
echo "Done."
