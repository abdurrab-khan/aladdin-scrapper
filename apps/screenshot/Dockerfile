FROM node:22-alpine

ARG PORT=3000 \
    SUPABASE_URL \
    SUPABASE_KEY    

ENV PORT=${PORT} \
    SUPABASE_URL=${SUPABASE_URL} \
    SUPABASE_KEY=${SUPABASE_KEY}

WORKDIR /screenshot

RUN npm install -g pnpm

COPY ./package.json ./pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000
ENTRYPOINT ["pnpm", "start"]