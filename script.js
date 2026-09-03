const nameInput = document.getElementById("Input");
const wheel = document.getElementById("wheel");
const wheelNames = document.querySelector(".wheel-names");
const rotationbt = document.querySelector(".clickbt");
const modalOverlay = document.getElementById("modalOverlay");
const winnerNameDisplay = document.getElementById("winnerName");
const btnContinue = document.getElementById("btnContinue");
const btnRemove = document.getElementById("btnRemove");
const btnImage = document.getElementById("Image");
const fileInput = document.getElementById("fileInput");
const winnerImageDisplay = document.getElementById("winnerImage");

const imageStorage = {};

const colors = [
    "hsla(51, 95%, 48%, 0.90)", 
    "rgb(24, 102, 220)", 
    "hsl(122, 85%, 37%)", 
    "rgb(167, 42, 33)"  
];

let names = [];
let currentRotation = 0;
let isSpinning = false;
let currentWinnerIndex = -1;

function getColor(index) {
    let colorIndex = index % colors.length;
    if (index === names.length - 1 && colorIndex === 0 && names.length > 1) {
        colorIndex = 1;
    }
    return colors[colorIndex];
}

function updateWheel() {
    if (names.length === 0) {
        wheel.style.background = "gray";
        return;
    }
    const angle = 360 / names.length;
    let gradientParts = [];
    names.forEach(function(name, index) {
        const startAngle = index * angle;
        const endAngle = (index + 1) * angle;
        const color = getColor(index);
        gradientParts.push(`${color} ${startAngle}deg ${endAngle}deg`);
    });
    wheel.style.background = `conic-gradient(from 90deg, ${gradientParts.join(", ")})`;
}

function getFontSize(count) {
    if (count <= 6) return 24;  
    if (count <= 12) return 18; 
    if (count <= 20) return 14; 
    if (count <= 30) return 12;
    return 10;                 
}

function updateNames() {
    wheelNames.innerHTML = "";
    if (names.length === 0) {
        return;
    }  
    const angle = 360 / names.length;
    const radius = 160; 
    const currentFontSize = getFontSize(names.length);
    names.forEach(function(name, index) {
        const middleAngle = index * angle + angle / 2;    
        const nameElement = document.createElement("div");
        nameElement.classList.add("wheel-name");
        
        let flipAngle = 0;
        if (middleAngle > 90 && middleAngle < 270) {
            flipAngle = 180;
        }
        if (imageStorage && imageStorage[name]) {
            const img = document.createElement("img");
            img.src = imageStorage[name];
            
            let imgSize = 80; 
            if (names.length > 25) imgSize = 30;
            else if (names.length > 15) imgSize = 45;
            else if (names.length > 8) imgSize = 60;
            img.style.width = `${imgSize}px`;  
            img.style.height = `${imgSize}px`;
            img.style.objectFit = "contain";
            img.style.borderRadius = "5px";
            img.style.transform = "rotate(270deg)";

            nameElement.style.display = "flex";
            nameElement.style.justifyContent = "center";
            nameElement.style.alignItems = "center";
            nameElement.appendChild(img);
        } 
        else {
            nameElement.textContent = name;
            nameElement.style.fontSize = `${currentFontSize}px`;
            if (middleAngle > 90 && middleAngle < 270) {
                flipAngle = 180;
            }
        }
        nameElement.style.transform =
            `
            rotate(${middleAngle}deg)
            translateX(${radius}px)
            rotate(${flipAngle}deg)
            translate(-50%, -50%)
            `;
        wheelNames.appendChild(nameElement);
    });
}
function spinWheel() {
    isSpinning = true;
    rotationbt.style.pointerEvents = "none";

    const winnerIndex = Math.floor(Math.random() * names.length);
    const winner = names[winnerIndex];
    console.log("Người thắng:", winner);

    const angle = 360 / names.length;
    const winnerAngle = winnerIndex * angle + angle / 2;
    const pointerAngle = 0;

    let absoluteTarget = pointerAngle - winnerAngle;
    if (absoluteTarget < 0) {
        absoluteTarget += 360;
    }
    let currentMod = currentRotation % 360; 
    let rotateDiff = absoluteTarget - currentMod; 
    
    if (rotateDiff < 0) {
        rotateDiff += 360;
    }

    const fullSpins = 6;
    const rotationToAdd = rotateDiff + (fullSpins * 360);

    currentRotation += rotationToAdd;

    wheel.style.transition = "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)";
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(function() {
        currentWinnerIndex = winnerIndex;

        if (imageStorage[winner]) {
            // Nếu là ảnh: Bật thẻ img, ẩn tên đi
            winnerImageDisplay.src = imageStorage[winner];
            winnerImageDisplay.style.display = "block";
            winnerNameDisplay.style.display = "none";
        } 
        else {
            winnerImageDisplay.style.display = "none";
            winnerNameDisplay.textContent = winner;
            winnerNameDisplay.style.display = "block";
        }
        
        modalOverlay.classList.add("show");
        isSpinning = false;
        rotationbt.style.pointerEvents = "auto";
    }, 5000);
}

nameInput.addEventListener("input", function() {
    let extractedParts = [];
    function parseNodes(node) {
        node.childNodes.forEach(child => {
            if (child.nodeName === 'IMG') {
                extractedParts.push(child.alt);
            } 
            else if (child.nodeName === 'BR') {
                extractedParts.push('\n');
            } 
            else if (child.nodeName === 'DIV' || child.nodeName === 'P') {
                extractedParts.push('\n');
                parseNodes(child);
            } 
            else if (child.nodeType === Node.TEXT_NODE) {
                extractedParts.push(child.textContent);
            } 
            else {
                parseNodes(child);
            }
        });
    }
    parseNodes(nameInput);
    const fullText = extractedParts.join('');
    
    names = fullText.split('\n')
        .map(name => name.trim())
        .filter(name => name !== "");

    updateWheel();
    updateNames();
});

rotationbt.addEventListener("click", function() {
    if (isSpinning) {
        return;
    }
    spinWheel();
});

btnContinue.addEventListener("click", function() {
    modalOverlay.classList.remove("show");
});

btnRemove.addEventListener("click", function() {
    if (currentWinnerIndex !== -1) {
        names.splice(currentWinnerIndex, 1);
        nameInput.innerHTML = "";
        names.forEach(name => {
            if (imageStorage[name]) {
                const img = document.createElement("img");
                img.src = imageStorage[name];
                img.alt = name;
                nameInput.appendChild(img);
            } 
            else {
                nameInput.appendChild(document.createTextNode(name));
            }
            nameInput.appendChild(document.createElement("br"));
        });

        updateWheel();
        updateNames();
    }
    modalOverlay.classList.remove("show");
});

btnImage.addEventListener("click", function() {
    fileInput.click();
});

fileInput.addEventListener("change", function(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result; 
            const uniqueId = Math.random().toString(36).substring(2, 7);
            const placeholder = `[Ảnh: ${file.name}_${uniqueId}]`;        
            imageStorage[placeholder] = dataUrl;

            const imgNode = document.createElement("img");
            imgNode.src = dataUrl;
            imgNode.alt = placeholder; 

            nameInput.appendChild(imgNode);
            nameInput.appendChild(document.createElement("br"));
            nameInput.dispatchEvent(new Event('input'));
        };
        reader.readAsDataURL(file);
    });
    fileInput.value = "";
});