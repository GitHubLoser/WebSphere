// 从本地存储加载数据
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['工作', '学习', '娱乐', '其他'];
let currentFilter = 'all';

// 保存分类到本地存储
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// 添加新分类
function addCategory() {
    const newCategoryInput = document.getElementById('newCategory');
    const categoryName = newCategoryInput.value.trim();
    
    if (!categoryName) {
        alert('请输入分类名称！');
        return;
    }
    
    if (categories.includes(categoryName)) {
        alert('该分类已存在！');
        return;
    }
    
    categories.push(categoryName);
    saveCategories();
    newCategoryInput.value = '';
    updateCategoryUI();
}

// 删除分类
function deleteCategory(category) {
    if (confirm(`确定要删除"${category}"分类吗？相关书签将移至"其他"分类。`)) {
        // 将该分类下的书签移至"其他"分类
        bookmarks = bookmarks.map(bookmark => {
            if (bookmark.category === category) {
                return { ...bookmark, category: '其他' };
            }
            return bookmark;
        });
        
        // 从分类列表中删除
        categories = categories.filter(c => c !== category);
        
        // 保存更改
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        saveCategories();
        
        // 更新UI
        updateCategoryUI();
        displayBookmarks();
    }
}

// 更新分类相关的UI
function updateCategoryUI() {
    // 更新分类过滤器
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = `
        <button onclick="filterBookmarks('all')" class="${currentFilter === 'all' ? 'active' : ''}">全部</button>
        ${categories.map(category => `
            <button onclick="filterBookmarks('${category}')" 
                    class="${currentFilter === category ? 'active' : ''}"
                    data-category="${category}">
                ${category}
                ${category !== '其他' ? `
                    <div class="category-actions">
                        <span class="material-icons edit-icon" 
                              onclick="event.stopPropagation(); editCategory('${category}')" 
                              title="编辑">
                            edit
                        </span>
                        <span class="material-icons delete-icon" 
                              onclick="event.stopPropagation(); deleteCategory('${category}')" 
                              title="删除">
                            close
                        </span>
                    </div>
                ` : ''}
            </button>
        `).join('')}
    `;
    
    // 更新分类选择下拉框
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = categories.map(category => 
        `<option value="${category}">${category}</option>`
    ).join('');
}

// 添加书签
function addBookmark() {
    const nameInput = document.getElementById('siteName');
    const urlInput = document.getElementById('siteUrl');
    const categorySelect = document.getElementById('category');
    
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const category = categorySelect.value;
    
    // 验证输入
    if (!name || !url) {
        alert('请填写网站名称和地址！');
        return;
    }
    
    // 确保URL格式正确
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // 添加新书签
    const bookmark = {
        name: name,
        url: url,
        category: category,
        id: Date.now()
    };
    
    bookmarks.push(bookmark);
    
    // 保存到本地存储
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    
    // 清空输入框
    nameInput.value = '';
    urlInput.value = '';
    
    // 更新显示
    displayBookmarks();
}

// 删除书签
function deleteBookmark(id) {
    bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    displayBookmarks();
}

// 过滤书签
function filterBookmarks(category) {
    currentFilter = category;
    
    // 更新过滤按钮状态
    document.querySelectorAll('.category-filter button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category || (category === 'all' && btn.textContent === '全部')) {
            btn.classList.add('active');
        }
    });
    
    displayBookmarks();
}

// 显示书签
function displayBookmarks() {
    const bookmarksList = document.getElementById('bookmarksList');
    bookmarksList.innerHTML = '';
    
    // 获取要显示的书签
    let filteredBookmarks = bookmarks;
    if (currentFilter !== 'all') {
        filteredBookmarks = bookmarks.filter(bookmark => bookmark.category === currentFilter);
    }
    
    // 按分类对书签进行分组
    const bookmarksByCategory = {};
    filteredBookmarks.forEach(bookmark => {
        if (!bookmarksByCategory[bookmark.category]) {
            bookmarksByCategory[bookmark.category] = [];
        }
        bookmarksByCategory[bookmark.category].push(bookmark);
    });
    
    // 按分类显示书签
    Object.keys(bookmarksByCategory).sort().forEach(category => {
        // 创建分类标题
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section';
        categoryDiv.innerHTML = `
            <div class="category-header">
                <h2>${category}</h2>
                <span class="bookmark-count">${bookmarksByCategory[category].length}个网站</span>
            </div>
        `;
        
        // 创建该分类下的书签列表
        const bookmarksDiv = document.createElement('div');
        bookmarksDiv.className = 'category-bookmarks';
        
        // 添加该分类下的所有书签
        bookmarksByCategory[category].forEach(bookmark => {
            const bookmarkDiv = document.createElement('div');
            bookmarkDiv.className = 'bookmark-item';
            bookmarkDiv.id = `bookmark_${bookmark.id}`;
            bookmarkDiv.innerHTML = `
                <div class="bookmark-content">
                    <div class="bookmark-info">
                        <a href="${bookmark.url}" target="_blank">
                            <span class="material-icons">link</span>
                            ${bookmark.name}
                        </a>
                    </div>
                    <div class="bookmark-actions">
                        <button class="edit-btn" onclick="editBookmark(${bookmark.id})" title="编辑">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="delete-btn" onclick="deleteBookmark(${bookmark.id})" title="删除">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            `;
            bookmarksDiv.appendChild(bookmarkDiv);
        });
        
        categoryDiv.appendChild(bookmarksDiv);
        bookmarksList.appendChild(categoryDiv);
    });
}

// 编辑书签
function editBookmark(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;

    const div = document.createElement('div');
    div.className = 'edit-form';
    div.innerHTML = `
        <input type="text" id="editName_${id}" value="${bookmark.name}" placeholder="网站名称">
        <input type="text" id="editUrl_${id}" value="${bookmark.url}" placeholder="网站地址">
        <select id="editCategory_${id}">
            ${categories.map(category => 
                `<option value="${category}" ${bookmark.category === category ? 'selected' : ''}>
                    ${category}
                </option>`
            ).join('')}
        </select>
        <div class="edit-actions">
            <button onclick="saveEdit(${id})" class="save-btn">
                <span class="material-icons">save</span>
            </button>
            <button onclick="cancelEdit(${id})" class="cancel-btn">
                <span class="material-icons">close</span>
            </button>
        </div>
    `;

    const card = document.querySelector(`#bookmark_${id}`);
    card.querySelector('.bookmark-content').style.display = 'none';
    card.appendChild(div);
}

// 保存编辑
function saveEdit(id) {
    const nameInput = document.getElementById(`editName_${id}`);
    const urlInput = document.getElementById(`editUrl_${id}`);
    const categorySelect = document.getElementById(`editCategory_${id}`);
    
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const category = categorySelect.value;
    
    if (!name || !url) {
        alert('请填写网站名称和地址！');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // 更新书签数据
    const index = bookmarks.findIndex(b => b.id === id);
    if (index !== -1) {
        bookmarks[index] = { ...bookmarks[index], name, url, category };
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        displayBookmarks();
    }
}

// 取消编辑
function cancelEdit(id) {
    const card = document.querySelector(`#bookmark_${id}`);
    card.querySelector('.bookmark-content').style.display = 'block';
    card.querySelector('.edit-form').remove();
}

// 添加侧边栏收缩功能
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // 保存状态到本地存储
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

// 页面加载时恢复侧边栏状态
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
});

// 编辑分类
function editCategory(category) {
    if (category === '其他') {
        alert('默认分类"其他"不能编辑');
        return;
    }

    const categoryFilter = document.getElementById('categoryFilter');
    const button = categoryFilter.querySelector(`button[data-category="${category}"]`);
    
    // 创建编辑输入框
    const editForm = document.createElement('div');
    editForm.className = 'category-edit-form';
    editForm.innerHTML = `
        <input type="text" value="${category}" class="category-edit-input">
        <div class="edit-actions">
            <button onclick="saveCategoryEdit('${category}', this.parentElement.parentElement)">
                <span class="material-icons">save</span>
            </button>
            <button onclick="cancelCategoryEdit('${category}', this.parentElement.parentElement)">
                <span class="material-icons">close</span>
            </button>
        </div>
    `;
    
    button.style.display = 'none';
    button.parentElement.insertBefore(editForm, button.nextSibling);
}

// 保存分类编辑
function saveCategoryEdit(oldCategory, editForm) {
    const newCategory = editForm.querySelector('.category-edit-input').value.trim();
    
    if (!newCategory) {
        alert('分类名称不能为空！');
        return;
    }
    
    if (categories.includes(newCategory) && newCategory !== oldCategory) {
        alert('该分类名称已存在！');
        return;
    }
    
    // 更新分类名称
    const categoryIndex = categories.indexOf(oldCategory);
    if (categoryIndex !== -1) {
        categories[categoryIndex] = newCategory;
        
        // 更新相关书签的分类
        bookmarks = bookmarks.map(bookmark => {
            if (bookmark.category === oldCategory) {
                return { ...bookmark, category: newCategory };
            }
            return bookmark;
        });
        
        // 保存更改
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        saveCategories();
        
        // 更新UI
        updateCategoryUI();
        displayBookmarks();
    }
}

// 取消分类编辑
function cancelCategoryEdit(category, editForm) {
    const button = document.querySelector(`button[data-category="${category}"]`);
    button.style.display = 'inline-flex';
    editForm.remove();
}

// 初始化
updateCategoryUI();
displayBookmarks(); 
displayBookmarks(); 