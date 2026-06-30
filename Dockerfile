FROM node:22

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/src/main"]
