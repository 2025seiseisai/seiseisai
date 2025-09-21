FROM node:24-alpine

# 必要ツール + タイムゾーン設定
ENV TZ=Asia/Tokyo
RUN apk add --no-cache \
      bash curl git unzip tzdata ca-certificates python3 build-base && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && echo "$TZ" > /etc/timezone

# Bun のインストール（公式インストーラ使用）
RUN bash -lc "curl -fsSL https://bun.sh/install | bash" && \
    ln -sf /root/.bun/bin/bun /usr/local/bin/bun

# 作業ディレクトリ
WORKDIR /workspace
