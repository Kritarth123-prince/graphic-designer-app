#!/bin/bash

# ============================================================
# DESIGNERSONA ADMIN SECURITY TEST
#
# Frontend: https://designersona.vercel.app
# Backend:  https://designer-sona.onrender.com
#
# Tests:
#   1. Frontend admin routes without authentication
#   2. Backend admin API without authentication
#   3. Backend admin API with fake cookie
#   4. Backend admin API with expired cookie
#   5. Backend admin API with modified valid cookie
#   6. Backend admin API with valid admin cookie
#
# BEFORE RUNNING:
#
# export VALID_ADMIN_COOKIE='session=YOUR_REAL_COOKIE'
# export EXPIRED_COOKIE='session=YOUR_EXPIRED_COOKIE'
#
# Do NOT put real cookies directly into this script.
# ============================================================


# ============================================================
# CONFIGURATION
# ============================================================

FRONTEND="http://localhost:5173"
BACKEND="http://localhost:5000"

OUT="admin-security-results"
SUMMARY="$OUT/SUMMARY.txt"

mkdir -p "$OUT"


# ============================================================
# COUNTERS
# ============================================================

PASS=0
FAIL=0
REVIEW=0
ROUTE_NOT_FOUND=0
CURL_ERRORS=0
TOTAL=0


# ============================================================
# COLORS
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'


# ============================================================
# HEADER
# ============================================================

echo
echo "============================================================"
echo "              DESIGNERSONA SECURITY TEST"
echo "============================================================"
echo "Frontend : $FRONTEND"
echo "Backend  : $BACKEND"
echo "Date     : $(date)"
echo "============================================================"
echo


# ============================================================
# START SUMMARY
# ============================================================

{
    echo "============================================================"
    echo "              DESIGNERSONA SECURITY TEST"
    echo "============================================================"
    echo "Frontend : $FRONTEND"
    echo "Backend  : $BACKEND"
    echo "Date     : $(date)"
    echo "============================================================"
    echo
} > "$SUMMARY"


# ============================================================
# COOKIE CONFIGURATION
# ============================================================

if [ -z "$VALID_ADMIN_COOKIE" ]; then
    echo -e "${YELLOW}[WARNING]${NC} VALID_ADMIN_COOKIE is not set."
    echo "Valid-admin tests will be skipped."
    echo
fi

if [ -z "$EXPIRED_COOKIE" ]; then
    echo -e "${YELLOW}[WARNING]${NC} EXPIRED_COOKIE is not set."
    echo "Expired-cookie tests will be skipped."
    echo
fi


# ============================================================
# SAFE FILENAME
# ============================================================

endpoint_filename() {

    echo "$1" \
        | sed 's#^/##' \
        | sed 's#/#-#g' \
        | sed 's#[^a-zA-Z0-9_-]#_#g'
}


# ============================================================
# RESULT CLASSIFICATION
# ============================================================

check_security_result() {

    local STATUS="$1"
    local TEST_TYPE="$2"

    case "$TEST_TYPE" in

        # ----------------------------------------------------
        # NO AUTH / FAKE AUTH / EXPIRED AUTH
        # ----------------------------------------------------

        unauthenticated)

            case "$STATUS" in

                401|403)
                    echo "PASS"
                    ;;

                404)
                    echo "ROUTE_NOT_FOUND"
                    ;;

                200|201|202|204)
                    echo "FAIL"
                    ;;

                500|502|503|504)
                    echo "REVIEW"
                    ;;

                CURL_ERROR)
                    echo "CURL_ERROR"
                    ;;

                *)
                    echo "REVIEW"
                    ;;

            esac

            ;;


        # ----------------------------------------------------
        # VALID ADMIN
        # ----------------------------------------------------

        valid_admin)

            case "$STATUS" in

                200|201|202|204)
                    echo "PASS"
                    ;;

                401|403)
                    echo "FAIL"
                    ;;

                404)
                    echo "ROUTE_NOT_FOUND"
                    ;;

                500|502|503|504)
                    echo "REVIEW"
                    ;;

                CURL_ERROR)
                    echo "CURL_ERROR"
                    ;;

                *)
                    echo "REVIEW"
                    ;;

            esac

            ;;


        # ----------------------------------------------------
        # FRONTEND
        # ----------------------------------------------------

        frontend)

            # A frontend SPA can legitimately return 200 for
            # /admin even when the user is not authenticated.
            #
            # Therefore this test DOES NOT consider 200 a
            # security PASS or FAIL.
            #
            # Actual admin protection must happen at the API.

            case "$STATUS" in

                404)
                    echo "ROUTE_NOT_FOUND"
                    ;;

                500|502|503|504)
                    echo "REVIEW"
                    ;;

                CURL_ERROR)
                    echo "CURL_ERROR"
                    ;;

                *)
                    echo "REVIEW"
                    ;;

            esac

            ;;


        *)
            echo "REVIEW"
            ;;

    esac
}


# ============================================================
# RUN TEST
# ============================================================

run_test() {

    local TEST_NAME="$1"
    local OUTPUT_FILE="$2"
    local TEST_TYPE="$3"

    shift 3

    TOTAL=$((TOTAL + 1))

    local RESPONSE_FILE="$OUT/$OUTPUT_FILE"
    local HEADERS_FILE="$OUT/.headers.tmp"
    local BODY_FILE="$OUT/.body.tmp"

    local STATUS
    local CURL_EXIT
    local RESULT

    # --------------------------------------------------------
    # CURL
    # --------------------------------------------------------

    STATUS=$(
        curl -sS \
            --max-time 30 \
            -D "$HEADERS_FILE" \
            -o "$BODY_FILE" \
            -w "%{http_code}" \
            "$@" \
            2>"$RESPONSE_FILE.curl-error"
    )

    CURL_EXIT=$?


    # --------------------------------------------------------
    # CURL FAILURE
    # --------------------------------------------------------

    if [ "$CURL_EXIT" -ne 0 ]; then

        STATUS="CURL_ERROR"

        {
            echo "============================================================"
            echo "CURL ERROR"
            echo "============================================================"
            echo "TEST: $TEST_NAME"
            echo "CURL EXIT CODE: $CURL_EXIT"
            echo
            cat "$RESPONSE_FILE.curl-error"
        } > "$RESPONSE_FILE"

        rm -f "$HEADERS_FILE"
        rm -f "$BODY_FILE"
        rm -f "$RESPONSE_FILE.curl-error"

    else

        # ----------------------------------------------------
        # SAVE FULL RESPONSE
        # ----------------------------------------------------

        {
            echo "============================================================"
            echo "TEST: $TEST_NAME"
            echo "HTTP STATUS: $STATUS"
            echo "============================================================"
            echo
            echo "==================== RESPONSE HEADERS ===================="
            cat "$HEADERS_FILE"
            echo
            echo "====================== RESPONSE BODY ====================="
            cat "$BODY_FILE"
        } > "$RESPONSE_FILE"

        rm -f "$HEADERS_FILE"
        rm -f "$BODY_FILE"
        rm -f "$RESPONSE_FILE.curl-error"

    fi


    # --------------------------------------------------------
    # SECURITY RESULT
    # --------------------------------------------------------

    RESULT=$(check_security_result "$STATUS" "$TEST_TYPE")


    # --------------------------------------------------------
    # COUNTERS
    # --------------------------------------------------------

    case "$RESULT" in

        PASS)
            PASS=$((PASS + 1))
            echo -e "${GREEN}[PASS]${NC} $TEST_NAME -> HTTP $STATUS"
            ;;

        FAIL)
            FAIL=$((FAIL + 1))
            echo -e "${RED}[FAIL]${NC} $TEST_NAME -> HTTP $STATUS"
            ;;

        ROUTE_NOT_FOUND)
            ROUTE_NOT_FOUND=$((ROUTE_NOT_FOUND + 1))
            echo -e "${YELLOW}[ROUTE NOT FOUND]${NC} $TEST_NAME -> HTTP $STATUS"
            ;;

        CURL_ERROR)
            CURL_ERRORS=$((CURL_ERRORS + 1))
            echo -e "${RED}[CURL ERROR]${NC} $TEST_NAME"
            ;;

        *)
            REVIEW=$((REVIEW + 1))
            echo -e "${YELLOW}[REVIEW]${NC} $TEST_NAME -> HTTP $STATUS"
            ;;

    esac


    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    {
        echo "------------------------------------------------------------"
        echo "TEST: $TEST_NAME"
        echo "HTTP STATUS: $STATUS"
        echo "RESULT: $RESULT"
        echo "RESPONSE FILE: $RESPONSE_FILE"
        echo "------------------------------------------------------------"
        echo
    } >> "$SUMMARY"
}


# ============================================================
# TEST FRONTEND
# ============================================================

FRONTEND_ROUTES=(
    "/admin"
    "/admin/products"
    "/admin/orders"
    "/admin/settings"
    "/admin/categories"
    "/admin/portfolio"
    "/admin/inquiries"
    "/admin/custom-requests"
)


echo
echo "============================================================"
echo " FRONTEND - NO AUTHENTICATION"
echo "============================================================"


for ROUTE in "${FRONTEND_ROUTES[@]}"; do

    NAME=$(endpoint_filename "$ROUTE")

    run_test \
        "FRONTEND NO AUTH - $ROUTE" \
        "frontend-${NAME}-no-auth.txt" \
        "frontend" \
        -H "Accept: text/html" \
        "$FRONTEND$ROUTE"

done


# ============================================================
# ADMIN API ENDPOINTS
#
# IMPORTANT:
# These paths MUST match your actual backend routes.
# ============================================================

ADMIN_ENDPOINTS=(
    "/api/admin/products"
    "/api/admin/orders"
    "/api/admin/settings"
    "/api/admin/categories"
    "/api/admin/portfolio"
    "/api/admin/inquiries"
    "/api/admin/custom-requests"
)


# ============================================================
# API - NO COOKIE
# ============================================================

echo
echo "============================================================"
echo " BACKEND API - NO COOKIE"
echo "============================================================"


for ENDPOINT in "${ADMIN_ENDPOINTS[@]}"; do

    NAME=$(endpoint_filename "$ENDPOINT")

    run_test \
        "NO COOKIE - $ENDPOINT" \
        "api-${NAME}-no-cookie.txt" \
        "unauthenticated" \
        -H "Accept: application/json" \
        "$BACKEND$ENDPOINT"

done


# ============================================================
# API - FAKE COOKIE
# ============================================================

echo
echo "============================================================"
echo " BACKEND API - FAKE COOKIE"
echo "============================================================"


for ENDPOINT in "${ADMIN_ENDPOINTS[@]}"; do

    NAME=$(endpoint_filename "$ENDPOINT")

    run_test \
        "FAKE COOKIE - $ENDPOINT" \
        "api-${NAME}-fake-cookie.txt" \
        "unauthenticated" \
        -H "Accept: application/json" \
        -H "Cookie: session=fake-invalid-cookie-value" \
        "$BACKEND$ENDPOINT"

done


# ============================================================
# API - EXPIRED COOKIE
# ============================================================

if [ -n "$EXPIRED_COOKIE" ]; then

    echo
    echo "============================================================"
    echo " BACKEND API - EXPIRED COOKIE"
    echo "============================================================"


    for ENDPOINT in "${ADMIN_ENDPOINTS[@]}"; do

        NAME=$(endpoint_filename "$ENDPOINT")

        run_test \
            "EXPIRED COOKIE - $ENDPOINT" \
            "api-${NAME}-expired-cookie.txt" \
            "unauthenticated" \
            -H "Accept: application/json" \
            -H "Cookie: $EXPIRED_COOKIE" \
            "$BACKEND$ENDPOINT"

    done

fi


# ============================================================
# API - MODIFIED VALID COOKIE
# ============================================================

if [ -n "$VALID_ADMIN_COOKIE" ]; then

    echo
    echo "============================================================"
    echo " BACKEND API - MODIFIED VALID COOKIE"
    echo "============================================================"


    # Change final character.
    MODIFIED_COOKIE="${VALID_ADMIN_COOKIE%?}X"


    for ENDPOINT in "${ADMIN_ENDPOINTS[@]}"; do

        NAME=$(endpoint_filename "$ENDPOINT")

        run_test \
            "MODIFIED VALID COOKIE - $ENDPOINT" \
            "api-${NAME}-modified-cookie.txt" \
            "unauthenticated" \
            -H "Accept: application/json" \
            -H "Cookie: $MODIFIED_COOKIE" \
            "$BACKEND$ENDPOINT"

    done

fi


# ============================================================
# API - VALID ADMIN COOKIE
# ============================================================

if [ -n "$VALID_ADMIN_COOKIE" ]; then

    echo
    echo "============================================================"
    echo " BACKEND API - VALID ADMIN COOKIE"
    echo "============================================================"


    for ENDPOINT in "${ADMIN_ENDPOINTS[@]}"; do

        NAME=$(endpoint_filename "$ENDPOINT")

        run_test \
            "VALID ADMIN COOKIE - $ENDPOINT" \
            "api-${NAME}-valid-admin-cookie.txt" \
            "valid_admin" \
            -H "Accept: application/json" \
            -H "Cookie: $VALID_ADMIN_COOKIE" \
            "$BACKEND$ENDPOINT"

    done

fi


# ============================================================
# FINAL REPORT
# ============================================================

echo
echo "============================================================"
echo " FINAL SECURITY REPORT"
echo "============================================================"

echo
echo "TOTAL TESTS:       $TOTAL"
echo "PASSED:            $PASS"
echo "FAILED:            $FAIL"
echo "REVIEW:            $REVIEW"
echo "ROUTES NOT FOUND:  $ROUTE_NOT_FOUND"
echo "CURL ERRORS:       $CURL_ERRORS"
echo


{
    echo
    echo "============================================================"
    echo " FINAL SECURITY REPORT"
    echo "============================================================"
    echo
    echo "TOTAL TESTS:       $TOTAL"
    echo "PASSED:            $PASS"
    echo "FAILED:            $FAIL"
    echo "REVIEW:            $REVIEW"
    echo "ROUTES NOT FOUND:  $ROUTE_NOT_FOUND"
    echo "CURL ERRORS:       $CURL_ERRORS"
    echo
} >> "$SUMMARY"


# ============================================================
# OVERALL RESULT
# ============================================================

if [ "$FAIL" -gt 0 ]; then

    echo -e "${RED}============================================================${NC}"
    echo -e "${RED} RESULT: ❌ SECURITY FAILURE${NC}"
    echo -e "${RED}============================================================${NC}"
    echo
    echo "One or more unauthenticated requests were accepted."
    echo "Review the [FAIL] entries immediately."


    {
        echo "RESULT: SECURITY FAILURE"
        echo "One or more unauthenticated requests were accepted."
    } >> "$SUMMARY"


elif [ "$CURL_ERRORS" -gt 0 ]; then

    echo -e "${YELLOW}============================================================${NC}"
    echo -e "${YELLOW} RESULT: ⚠️ CONNECTION ERRORS${NC}"
    echo -e "${YELLOW}============================================================${NC}"
    echo
    echo "Some requests could not be completed."


    {
        echo "RESULT: CONNECTION ERRORS"
    } >> "$SUMMARY"


elif [ "$PASS" -eq 0 ]; then

    echo -e "${YELLOW}============================================================${NC}"
    echo -e "${YELLOW} RESULT: ⚠️ NO SECURITY PASS CONFIRMED${NC}"
    echo -e "${YELLOW}============================================================${NC}"
    echo
    echo "No endpoint returned a confirmed authentication PASS."
    echo
    echo "Most likely causes:"
    echo "  - API endpoint paths are incorrect"
    echo "  - Backend routes use different paths"
    echo "  - Authentication tests were skipped"
    echo "  - Backend is not exposing these routes"


    {
        echo "RESULT: NO SECURITY PASS CONFIRMED"
    } >> "$SUMMARY"


elif [ "$ROUTE_NOT_FOUND" -gt 0 ]; then

    echo -e "${YELLOW}============================================================${NC}"
    echo -e "${YELLOW} RESULT: ⚠️ PARTIALLY TESTED${NC}"
    echo -e "${YELLOW}============================================================${NC}"
    echo
    echo "Some routes were not found."
    echo "Verify that ADMIN_ENDPOINTS matches your actual backend."


    {
        echo "RESULT: PARTIALLY TESTED"
        echo "Some routes were not found."
    } >> "$SUMMARY"


else

    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN} RESULT: ✅ SECURITY TEST PASSED${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo
    echo "All executed authentication tests passed."


    {
        echo "RESULT: SECURITY TEST PASSED"
        echo "All executed authentication tests passed."
    } >> "$SUMMARY"

fi


# ============================================================
# OUTPUT
# ============================================================

echo
echo "============================================================"
echo " RESULTS"
echo "============================================================"
echo
echo "Directory:"
echo "$OUT/"
echo
echo "Main report:"
echo "$SUMMARY"
echo


# ============================================================
# KEEP TERMINAL OPEN FOR 10 SECONDS
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

