let annotationMode = false;
let hoverBox = null;

// 创建一个高亮框
function createHoverBox() {
  hoverBox = document.createElement("div");
  hoverBox.style.position = "absolute";
  hoverBox.style.border = "2px solid red";
  hoverBox.style.pointerEvents = "none"; // 不阻止鼠标事件
  hoverBox.style.zIndex = "999999";
  document.body.appendChild(hoverBox);
}

// 进入/退出标注模式
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TOGGLE_ANNOTATION_MODE") {
    annotationMode = !annotationMode;
    if (annotationMode) {
      if (!hoverBox) createHoverBox();
      alert("标注模式已开启，移动鼠标选择元素，点击即可添加说明");
    } else {
      if (hoverBox) hoverBox.style.display = "none";
      alert("标注模式已关闭");
    }
  }
});

// 鼠标移动时更新高亮框位置
document.addEventListener("mousemove", (e) => {
  if (!annotationMode || !hoverBox) return;
  const el = e.target;
  const rect = el.getBoundingClientRect();
  hoverBox.style.display = "block";
  hoverBox.style.left = rect.left + window.scrollX + "px";
  hoverBox.style.top = rect.top + window.scrollY + "px";
  hoverBox.style.width = rect.width + "px";
  hoverBox.style.height = rect.height + "px";
});

// 点击元素添加标注
document.addEventListener("click", async (e) => {
  if (!annotationMode) return;

  e.preventDefault();
  e.stopPropagation();

  const selector = getUniqueSelector(e.target);
  const text = prompt("请输入该元素的说明：");
  if (!text) return;

  const url = location.href;
  const data = (await chrome.storage.local.get(url))[url] || {};
  data[selector] = text;
  await chrome.storage.local.set({ [url]: data });

  renderAnnotations();
});

// 获取唯一选择器
function getUniqueSelector(el) {
    if (el.id) return `#${el.id}`;
  
    let path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE && el !== document.body) {
      let selector = el.nodeName.toLowerCase();
  
      // 如果有 class，用 class
      if (el.className) {
        const className = el.className.trim().split(/\s+/).join(".");
        if (className) {
          selector += "." + className;
        }
      }
  
      // 确保唯一：加上 nth-of-type
      if (el.parentNode) {
        const siblings = Array.from(el.parentNode.children)
          .filter(c => c.nodeName === el.nodeName);
        if (siblings.length > 1) {
          const index = Array.from(el.parentNode.children).indexOf(el) + 1;
          selector += `:nth-child(${index})`;
        }
      }
  
      path.unshift(selector);
      el = el.parentNode;
    }
  
    return path.join(" > ");
  }
  
// 渲染标注（和之前一样）
async function renderAnnotations() {
    const url = location.href;
    const data = (await chrome.storage.local.get(url))[url] || {};
  
    // 清理旧的 ❗
    document.querySelectorAll(".annotation-icon").forEach(el => el.remove());
  
    Object.entries(data).forEach(([selector, text]) => {
      const target = document.querySelector(selector);
      if (target) {
        const icon = document.createElement("span");
        icon.textContent = "❗";
        icon.className = "annotation-icon";
        icon.title = text;
  
        // === 右键菜单 ===
        icon.addEventListener("contextmenu", async (e) => {
          e.preventDefault();
          e.stopPropagation();
  
          const choice = prompt("输入 'e' 编辑备注，输入 'd' 删除备注：", "e");
          if (!choice) return;
  
          if (choice.toLowerCase() === "e") {
            const newText = prompt("请输入新的备注：", text);
            if (newText) {
              data[selector] = newText;
              await chrome.storage.local.set({ [url]: data });
              renderAnnotations();
            }
          } else if (choice.toLowerCase() === "d") {
            delete data[selector];
            await chrome.storage.local.set({ [url]: data });
            renderAnnotations();
          }
        });
  
        target.appendChild(icon);
      }
    });
  }
  
  