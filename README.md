```js
docker run --name local_postgres \
  -e POSTGRES_DB=local_db \
  -e POSTGRES_USER=local_user \
  -e POSTGRES_PASSWORD=local_password \
  -p 5432:5432 \
  -v "$(pwd)/pgdata:/var/lib/postgresql/data" \
  -d postgres
```

sudo lsof -i :5432
