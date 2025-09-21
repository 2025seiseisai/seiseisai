FROM ubuntu:24.04

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get install -y curl git unzip build-essential && \
    rm -rf /var/lib/apt/lists/*

# nvmとNode.jsのインストール
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
RUN \. "$HOME/.nvm/nvm.sh"
RUN nvm install latest

# Bunのインストール
RUN npm install -g bun@latest

# 作業ディレクトリの設定
WORKDIR /workspace

# タイムゾーンの設定
ENV TZ=Asia/Tokyo
