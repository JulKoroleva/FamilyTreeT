const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const bases = [
    { base: 'Base_1', params: ['Tarasenko', 'Bocharov', 'Shalabai', 'Palamar'], src: './img/Base_1.svg' },
    { base: 'Base_2', params: ['Tarasenko', 'Drach', 'Gandzuk', 'Ivanov'], src: './img/Base_2.svg' },
    { base: 'Base_3', params: ['Tarasenko', 'Drach', 'Skorik', 'Kukareka', 'Pris'], src: './img/Base_3.svg' },
    { base: 'Base_4', params: ['Tarasenko', 'Bocharov', 'Jaivoronok', 'Shalabai'], src: './img/Base_4.svg' }
];

const images = [
    { param: 'Tarasenko', src: './img/Tarasenko.svg' , title: 'Тарасенко'},
    { param: 'Palamar', src: './img/Palamar.svg', title: 'Паламарчук' },
    { param: 'Drach', src: './img/Drach.svg', title: 'Драч' },
    { param: 'Gandzuk', src: './img/Gandzuk.svg', title: 'Гандзюк' },
    { param: 'Jaivoronok', src: './img/Jaivoronok.svg', title: 'Жайворонок' },
    { param: 'Shalabai', src: './img/Shalabai.svg', title: 'Шалабай' },
    { param: 'Pris', src: './img/Pris.svg', title: 'Присяжнюк' },
    { param: 'Bocharov', src: './img/Bocharov.svg', title: 'Бочаров' },
    { param: 'Ivanov', src: './img/Ivanov.svg', title: 'Иванов' },
    { param: 'Skorik', src: './img/Skorik.svg', title: 'Скорик' },
    { param: 'Kukareka', src: './img/Kukareka.svg', title: 'Кукарека' },
];

const checkboxColors = {
    'Tarasenko': '#5c90ce',
    'Bocharov': '#fe2e2e',
    'Shalabai': '#ff7a00',
    'Palamar': '#e24f4f',
    'Drach': '#41918d',
    'Gandzuk': '#bc3da0',
    'Ivanov': '#da4893',
    'Skorik': '#59c3f8',
    'Kukareka': '#e6e049',
    'Pris': '#5aa459',
    'Jaivoronok': '#8c70cb'
};

let loadedImages = {};
let selectedParams = new Set(['Tarasenko']);

let currentBase = 'Base_1';

let scale = 0.17;
let offsetX = -200;
let offsetY = 100;
let isDragging = false;

function loadImages(callback) {
    let count = images.length + bases.length;

    const loadImage = (src, onLoad) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            onLoad(img);
            count--;
            if (count === 0) callback();
        };
        img.onerror = () => {
            console.error(`Error loading image: ${src}`);
        };
    };

    bases.forEach(base => {
        loadImage(base.src, (img) => {
            loadedImages[base.src] = img;
        });
    });

    images.forEach(image => {
        loadImage(image.src, (img) => {
            loadedImages[image.src] = img;
        });
    });
}

function drawImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const base = selectBase(); // Вызываем selectBase, чтобы база точно была обновлена

    if (loadedImages[base.src]) {
        ctx.drawImage(loadedImages[base.src], 0, 0);
        console.log(`Drawing base: ${base.base}`);
    } else {
        console.error(`Base image not loaded: ${base.src}`);
    }

    selectedParams.forEach(param => {
        const img = images.find(img => img.param === param);
        if (img && loadedImages[img.src]) {
            ctx.drawImage(loadedImages[img.src], 0, 0);
        }
    });

    ctx.restore();
}

function selectBase() {
    let bestBase = null;
    let maxParamsMatched = 0;
    let currentBaseParams = bases.find(base => base.base === currentBase)?.params || [];

    bases.forEach(base => {
        const paramsMatched = base.params.filter(param => selectedParams.has(param)).length;

        // Если в базе есть выбранный параметр, которого нет в текущей основе
        const hasNewParam = base.params.some(param => selectedParams.has(param) && !currentBaseParams.includes(param));

        if (hasNewParam && paramsMatched >= maxParamsMatched) {
            bestBase = base;
            maxParamsMatched = paramsMatched;
        }
    });

    if (bestBase && currentBase !== bestBase.base) {
        currentBase = bestBase.base;
        console.log('Changed base to:', currentBase);
        updateCheckboxesBasedOnBase(bestBase);
    } else {
        console.log('No suitable base found or base did not change.');
    }

    return bestBase || bases.find(base => base.base === currentBase); // Возвращаем текущую базу, если нет лучшей
}

function updateCheckboxesBasedOnBase(base) {
    // Сбрасываем все параметры, которые не поддерживаются текущей основой
    selectedParams.forEach(param => {
        if (!base.params.includes(param)) {
            selectedParams.delete(param);
            const checkbox = document.getElementById(`img${images.findIndex(img => img.param === param) + 1}-checkbox`);
            checkbox.checked = false;

            // Возвращаем прозрачность 50% после сброса
            const rgbaColor = hexToRgba(checkboxColors[param], 0.5);
            checkbox.style.backgroundColor = rgbaColor;
            checkbox.style.borderColor = rgbaColor;
        }
    });

    // Принудительно обновляем отображение изображений
    drawImages();
}


function handleCheckboxChange(param, checked, checkbox) {
    if (checked) {
        selectedParams.add(param);
        checkbox.style.color = checkboxColors[param] || '#5c90ce'; // Устанавливаем цвет галочки и фона при включении
        checkbox.style.backgroundColor = checkboxColors[param]; // Применяем основной цвет при включении
        checkbox.style.borderColor = checkboxColors[param];
    } else {
        selectedParams.delete(param);
        const rgbaColor = hexToRgba(checkboxColors[param], 0.5); // Создаем цвет с прозрачностью 50%
        checkbox.style.backgroundColor = rgbaColor; // Применяем прозрачный цвет при выключении
        checkbox.style.borderColor = rgbaColor;
    }

    // Обновляем основу и отображение
    selectBase();
    drawImages();
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

loadImages(() => {
    // Принудительная отрисовка с изначальной базой
    drawImages();

    images.forEach((image, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `img${index + 1}-checkbox`;
        checkbox.checked = selectedParams.has(image.param);
        const rgbaColor = hexToRgba(checkboxColors[image.param], 0.5); // Создаем цвет с прозрачностью 50%
        checkbox.style.backgroundColor = checkbox.checked ? checkboxColors[image.param] : rgbaColor;
        checkbox.style.borderColor = checkbox.checked ? checkboxColors[image.param] : rgbaColor;
        checkbox.style.color = checkboxColors[image.param] || '#000';
        // Обработка изменения состояния чекбокса
        checkbox.addEventListener('change', (event) => {
            handleCheckboxChange(image.param, event.target.checked, checkbox);
        });

        const label = document.createElement('label');
        label.className = 'checkbox-label';
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(image.title));

        document.querySelector('.controls').appendChild(label);
    });
    
    const text = document.createElement('div');
    text.textContent = 'Кудрик';
    text.style.padding = '5px 10px 5px';
    text.style.backgroundColor = 'rgba(250, 100, 102, 0.45)';
    text.style.borderRadius = '5px';
document.querySelector('.controls').appendChild(text);

    const text1 = document.createElement('div');
    text1.textContent = 'Марчишина';
    text1.style.padding = '5px 10px 5px';
    text1.style.backgroundColor = 'rgba(254, 127, 72, 0.25)';
    text1.style.marginTop = '10px';
    text1.style.borderRadius = '5px';
    document.querySelector('.controls').appendChild(text1);

    const text2 = document.createElement('div');
    text2.textContent = 'Панькова';
    text2.style.padding = '5px 10px 5px';
    text2.style.backgroundColor = 'rgba(250, 100, 102, 0.25)';
    text2.style.marginTop = '10px';
    text2.style.borderRadius = '5px';

    document.querySelector('.controls').appendChild(text2);
    const text3 = document.createElement('div');
    text3.textContent = 'Чередник';
    text3.style.padding = '5px 10px 5px';
    text3.style.backgroundColor = 'rgba(68, 82, 236, 0.25)';
    text3.style.marginTop = '10px';
    text3.style.borderRadius = '5px';
document.querySelector('.controls').appendChild(text3);

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
    
        // Позиция курсора относительно холста
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    
        // Позиция курсора в координатах холста с учетом текущего смещения и масштаба
        const mouseCanvasX = (mouseX - offsetX) / scale;
        const mouseCanvasY = (mouseY - offsetY) / scale;
    
        // Изменение масштаба
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(0.125, scale + delta), 4);
    
        // Обновляем смещение с учетом нового масштаба
        offsetX -= mouseCanvasX * (newScale - scale);
        offsetY -= mouseCanvasY * (newScale - scale);
    
        // Применяем новый масштаб
        scale = newScale;
    
        drawImages();
    });

    canvas.addEventListener('mousedown', (event) => {
        startX = event.clientX - offsetX;
        startY = event.clientY - offsetY;
        isDragging = true;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            offsetX = event.clientX - startX;
            offsetY = event.clientY - startY;
            drawImages();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
});
