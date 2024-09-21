
$STAGED_FILES=(git diff --cached --name-only)
cd frontend
pnpm run lint
cd ..

cd backend
pnpm run lint
cd ..

$STAGED_FILES | ForEach-Object { git add $_ }