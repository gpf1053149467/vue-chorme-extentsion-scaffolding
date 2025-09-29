# Content Script 模块化结构

## 概述

Content script 已经重构为模块化结构，并集成了Vue组件来处理标注弹框，提高了代码的可维护性和可扩展性。

## 目录结构

```
src/content/
├── App.vue                 # 主入口文件，简化后的逻辑
├── components/             # UI组件模块
│   ├── AnnotationDialog.vue # Vue标注弹框组件
│   ├── ContextMenu.vue    # Vue右键悬浮菜单组件
│   ├── uiComponents.js     # UI组件类（高亮框、标注图标）
│   ├── eventHandler.js     # 事件处理器类
│   └── vueComponentManager.js # Vue组件管理器
├── utils/                  # 工具模块
│   ├── styles.js          # 样式管理
│   ├── helpers.js         # 工具函数
│   └── annotationManager.js # 标注数据管理
└── main.js                # 入口文件
```

## 模块说明

### 1. App.vue
- **职责**: 主入口文件，负责初始化和清理
- **功能**: 
  - 导入样式
  - 创建事件处理器实例
  - 生命周期管理

### 2. utils/styles.js
- **职责**: 样式管理
- **功能**:
  - `addStyles()`: 添加CSS样式到页面
  - `removeStyles()`: 移除样式

### 3. utils/helpers.js
- **职责**: 工具函数
- **功能**:
  - `getUniqueSelector()`: 生成唯一选择器
  - `isPluginElement()`: 检测是否是插件元素
  - `isOriginalPageElement()`: 检测是否是原始页面元素

### 4. utils/annotationManager.js
- **职责**: 标注数据管理
- **功能**:
  - `AnnotationManager` 类
  - 标注的增删改查操作
  - Chrome storage 交互
  - **Vue组件弹框集成**（替代Element Plus）

### 5. components/AnnotationDialog.vue
- **职责**: Vue标注弹框组件
- **功能**:
  - 支持添加、编辑、删除三种模式
  - 自定义样式和主题
  - 键盘快捷键支持（Ctrl+Enter确认，Escape取消）
  - 响应式设计

### 6. components/ContextMenu.vue
- **职责**: Vue右键悬浮菜单组件
- **功能**:
  - 支持编辑和删除操作
  - 智能位置计算，避免超出视窗
  - 动画效果和主题样式
  - 响应式设计

### 7. components/vueComponentManager.js
- **职责**: Vue组件管理
- **功能**:
  - `VueComponentManager` 类: 通用Vue组件管理器
  - `AnnotationDialogManager` 类: 标注弹框专用管理器
  - `ContextMenuManager` 类: 悬浮菜单专用管理器
  - Vue应用实例的创建和销毁
  - 组件生命周期管理

### 8. components/uiComponents.js
- **职责**: UI组件管理
- **功能**:
  - `HoverBox` 类: 高亮框组件
  - `AnnotationIcon` 类: 标注图标组件

### 9. components/eventHandler.js
- **职责**: 事件处理
- **功能**:
  - `EventHandler` 类
  - 鼠标事件处理
  - 消息监听
  - 标注操作处理

## 主要改进

### 1. Vue组件集成
- **自定义弹框**: 使用Vue组件替代Element Plus弹框
- **自定义悬浮菜单**: 使用Vue组件替代原生下拉菜单
- **更好的控制**: 完全控制UI组件的样式和行为
- **主题支持**: 支持不同操作类型的主题样式
- **键盘支持**: 支持键盘快捷键操作

### 2. 代码分离
- 将原本500+行的单一文件拆分为多个专门模块
- Vue组件独立管理，便于维护和扩展

### 3. 类化设计
- 使用ES6类来组织相关功能
- 提供清晰的API接口

### 4. 依赖管理
- 模块间依赖关系清晰
- 便于单元测试和调试

### 5. 扩展性
- 新功能可以独立开发
- 不影响现有功能

## Vue组件特性

### AnnotationDialog.vue
- **三种模式**: 添加、编辑、删除确认
- **自定义样式**: 每种模式有不同的主题色彩
- **键盘支持**: 
  - `Ctrl+Enter`: 确认操作
  - `Escape`: 取消操作
- **响应式**: 自适应不同屏幕尺寸
- **无障碍**: 支持屏幕阅读器

### ContextMenu.vue
- **两种操作**: 编辑和删除
- **智能定位**: 自动计算位置，避免超出视窗
- **动画效果**: 平滑的出现和消失动画
- **主题样式**: 编辑（蓝色）和删除（红色）不同主题
- **响应式**: 移动端适配

### VueComponentManager
- **动态创建**: 运行时创建Vue应用实例
- **生命周期管理**: 自动处理组件的创建和销毁
- **内存管理**: 防止内存泄漏
- **多实例支持**: 支持同时管理多个Vue组件

## 使用方式

### 添加新功能
1. 在对应模块中添加新方法
2. 在 `EventHandler` 中集成新的事件处理
3. 更新相关UI组件

### 修改现有功能
1. 定位到对应的模块文件
2. 修改相关方法
3. 测试功能完整性

### 自定义悬浮菜单
1. 修改 `ContextMenu.vue` 组件
2. 更新 `ContextMenuManager` 中的相关方法
3. 测试新的悬浮菜单功能

## 调试

- 每个模块可以独立调试
- 使用浏览器开发者工具查看模块加载情况
- Vue DevTools 可以调试Vue组件

## 注意事项

1. **模块导入**: 确保所有模块正确导入
2. **生命周期**: 注意组件的创建和销毁时机
3. **事件绑定**: 避免内存泄漏，及时清理事件监听器
4. **样式隔离**: 确保插件样式不影响页面原有样式
5. **Vue组件**: 确保Vue组件正确销毁，避免内存泄漏

## 未来扩展建议

1. **配置管理**: 可以添加配置模块来管理插件设置
2. **主题系统**: 可以扩展样式模块支持主题切换
3. **快捷键**: 可以添加键盘事件处理
4. **数据同步**: 可以添加云端同步功能
5. **导出功能**: 可以添加标注数据的导出功能
6. **更多Vue组件**: 可以创建更多Vue组件来替代原生DOM操作