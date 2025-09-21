FROM ubuntu:24.04

# bash を既定のシェルに
SHELL ["/bin/bash", "-lc"]

# 基本ツール + タイムゾーン設定
ENV DEBIAN_FRONTEND=noninteractive TZ=Asia/Tokyo
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl git unzip build-essential ca-certificates tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*

# nvm と Node.js (LTS) をインストール
ENV NVM_DIR=/root/.nvm
RUN curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && \
    source "$NVM_DIR/nvm.sh" && \
    nvm install --lts && nvm alias default 'lts/*' && nvm use default && \
    ln -sf "$(command -v node)" /usr/local/bin/node && \
    ln -sf "$(dirname "$(command -v node)")/npm" /usr/local/bin/npm && \
    ln -sf "$(dirname "$(command -v node)")/npx" /usr/local/bin/npx

# Bun のインストール
ENV BUN_INSTALL=/root/.bun
RUN curl -fsSL https://bun.sh/install | bash && \
    ln -sf "$BUN_INSTALL/bin/bun" /usr/local/bin/bun

# 作業ディレクトリ
WORKDIR /workspace
