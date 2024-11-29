
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker to proceed."
    exit 1
else
    echo "Docker is installed."
fi


function install_docker() {
    echo "Installing Docker..."

    # Add Docker's official GPG key:
    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update

    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Verify Docker installation
    if command -v docker &> /dev/null
    then
        echo "Docker has been installed successfully."
    else
        echo "Docker installation failed."
        exit 1
    fi
}

function install_docker_compose() {
    echo "Installing Docker Compose..."

    # Download the current stable release of Docker Compose
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
    ARCHITECTURE="$(uname -m)"
    if [ "$ARCHITECTURE" = "x86_64" ]; then
        ARCHITECTURE="linux-x86_64"
    elif [ "$ARCHITECTURE" = "aarch64" ]; then
        ARCHITECTURE="linux-aarch64"
    else
        echo "Unsupported architecture: $ARCHITECTURE"
        exit 1
    fi
    sudo curl -L "https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-$ARCHITECTURE" -o /usr/local/bin/docker-compose

    # Apply executable permissions to the binary
    sudo chmod +x /usr/local/bin/docker-compose

    # Verify Docker Compose installation
    if command -v docker-compose &> /dev/null
    then
        echo "Docker Compose has been installed successfully."
    else
        echo "Docker Compose installation failed."
        exit 1
    fi
}

function install_nvm_and_npm() {
    echo "Installing NVM (Node Version Manager)..."

    # Download and install NVM
    NVM_VERSION=$(git ls-remote --tags https://github.com/nvm-sh/nvm.git | grep -o 'v[0-9]*\.[0-9]*\.[0-9]*' | sort -V | tail -n1)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh | bash

    # Load NVM
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

    # Verify NVM installation
    if command -v nvm &> /dev/null
    then
        echo "NVM has been installed successfully."
    else
        echo "NVM installation failed."
        exit 1
    fi

    echo "Installing latest Node.js and npm using NVM..."
    nvm install node

    # Verify npm installation
    if command -v npm &> /dev/null
    then
        echo "npm has been installed successfully."
    else
        echo "npm installation failed."
        exit 1
    fi
}

# Check if npm is installed, if not, install it using NVM
if ! command -v npm &> /dev/null
then
    install_nvm_and_npm
else
    echo "npm is already installed."
fi



# Check if Docker is installed, if not, install it
if ! command -v docker &> /dev/null
then
    install_docker
else
    echo "Docker is already installed."
fi

# Check if Docker Compose is installed, if not, install it
if ! command -v docker-compose &> /dev/null
then
    install_docker_compose
else
    echo "Docker Compose is already installed."
fi

# Check if npm is installed, if not, prompt the user to install it
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Please install Node.js and npm to proceed."
    exit 1
else
    echo "npm is already installed."
fi

echo "Installing npm packages..."
npm install
if [ $? -eq 0 ]; then
    echo "npm packages installed successfully."
else
    echo "Failed to install npm packages."
    exit 1
fi