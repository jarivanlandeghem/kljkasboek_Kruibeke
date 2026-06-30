FROM node:22

ENV NPM_CONFIG_ONLY_BUILT_DEPENDENCIES='["@nestjs/core","argon2","esbuild","unrs-resolver"]'

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY . .

RUN pnpm install
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/src/main"]
