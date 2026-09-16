BASE="https://designer-sona.onrender.com"

{
  echo "===== /api/health ====="
  curl -i "$BASE/api/health"

  echo -e "\n===== /api/settings ====="
  curl -i "$BASE/api/settings"

  echo -e "\n===== /api/products ====="
  curl -i "$BASE/api/products"

  echo -e "\n===== /api/categories ====="
  curl -i "$BASE/api/categories"

  echo -e "\n===== /api/portfolio ====="
  curl -i "$BASE/api/portfolio"

  echo -e "\n===== /sitemap.xml ====="
  curl -i "$BASE/sitemap.xml"

  echo -e "\n===== /robots.txt ====="
  curl -i "$BASE/robots.txt"

  echo -e "\n===== POST /api/auth/login — empty body ====="
  curl -i -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}'

  echo -e "\n===== POST /api/auth/login — wrong credentials ====="
  curl -i -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@example.com","password":"wrong"}'

} > response_login.txt 2>&1
