<template>
  <div class="app">
    <!-- Page: Home -->
    <template v-if="page === 'home'">
      <Header
        title="Dashboard"
        subtitle="Main page"
        :dropdown-items="recentPages"
        @navigate="navigate"
      >
        <button class="demo-btn" @click="navigate('settings')">Settings</button>
      </Header>
      <div class="page-content">
        <h2>Pages</h2>
        <div class="nav-grid">
          <div class="nav-card" @click="navigate('products')">
            <div class="nav-card-title">Products</div>
            <div class="nav-card-desc">Product list with actions</div>
          </div>
          <div class="nav-card" @click="navigate('orders')">
            <div class="nav-card-title">Orders</div>
            <div class="nav-card-desc">Orders with dialogs</div>
          </div>
          <div class="nav-card" @click="navigate('settings')">
            <div class="nav-card-title">Settings</div>
            <div class="nav-card-desc">Nested pages</div>
          </div>
          <div class="nav-card" @click="navigate('reports')">
            <div class="nav-card-title">Reports</div>
            <div class="nav-card-desc">Modal examples</div>
          </div>
        </div>

        <h2 style="margin-top: 32px">Components</h2>

        <h3 class="section-title">Dialog (Next)</h3>
        <p class="section-desc">Full-screen dialog with back button. Modern style.</p>
        <button class="demo-btn" @click="showHomeDialogNext = true">Open Dialog Next</button>
        <Dialog v-model="showHomeDialogNext" mode="next" title="Dialog Next" subtitle="Modern full-screen dialog">
          <div style="padding: 20px">
            <p>This is the <strong>Next</strong> style dialog — full-screen with a back arrow button.</p>
            <p style="margin-top: 12px; color: #888">Used as the default dialog style in rocketMode.</p>
          </div>
          <template #buttons>
            <button class="demo-btn" @click="showHomeDialogNext = false">Cancel</button>
            <button class="demo-btn primary" @click="showHomeDialogNext = false">OK</button>
          </template>
        </Dialog>

        <h3 class="section-title">Dialog (Classic)</h3>
        <p class="section-desc">Full-screen dialog with close (X) button. Classic style.</p>
        <button class="demo-btn" @click="showHomeDialogClassic = true">Open Dialog Classic</button>
        <Dialog v-model="showHomeDialogClassic" mode="classic" title="Dialog Classic" subtitle="Classic full-screen dialog">
          <div style="padding: 20px">
            <p>This is the <strong>Classic</strong> style dialog — full-screen with an X close button.</p>
            <p style="margin-top: 12px; color: #888">Used when rocketMode is off.</p>
          </div>
          <template #buttons>
            <button class="demo-btn" @click="showHomeDialogClassic = false">Close</button>
          </template>
        </Dialog>

        <h3 class="section-title">Modal (Full-screen)</h3>
        <p class="section-desc">Overlay modal with back button, scrollable body, optional footer.</p>
        <button class="demo-btn" @click="showHomeModal = true">Open Full Modal</button>
        <Modal v-model="showHomeModal" title="Full-screen Modal" subtitle="With scrollable content">
          <div style="padding: 16px">
            <p v-for="i in 15" :key="i">Content line {{ i }}</p>
          </div>
          <template #footer>
            <button class="demo-btn" @click="showHomeModal = false">Close</button>
          </template>
        </Modal>

        <h3 class="section-title">SkyButton</h3>
        <p class="section-desc">Variants: primary, danger, secondary, outline. Підтримує loading, disabled, block, icon.</p>
        <div class="button-demo-grid">
          <SkyButton variant="primary">Primary</SkyButton>
          <SkyButton variant="danger">Danger</SkyButton>
          <SkyButton variant="secondary">Secondary</SkyButton>
          <SkyButton variant="outline">Outline</SkyButton>
          <SkyButton variant="primary" :loading="btnLoading" @click="btnLoading = !btnLoading">Loading</SkyButton>
          <SkyButton variant="primary" disabled>Disabled</SkyButton>
        </div>
        <div class="button-demo-grid" style="margin-top: 8px">
          <SkyButton variant="primary" icon title="Add">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </SkyButton>
          <SkyButton variant="danger" icon title="Delete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </SkyButton>
          <SkyButton variant="secondary" icon title="Edit">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </SkyButton>
          <SkyButton variant="outline" icon title="Search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9.5 9.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </SkyButton>
          <SkyButton variant="primary" icon :loading="btnLoading" @click="btnLoading = !btnLoading" title="Loading icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v3M8 12v3M1 8h3M12 8h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </SkyButton>
        </div>
        <div style="margin-top: 8px">
          <SkyButton variant="primary" block>Block (full width)</SkyButton>
        </div>

        <h3 class="section-title">SkySelect</h3>
        <p class="section-desc">Кастомний select. Підтримує placeholder, disabled, block, клавіатуру.</p>
        <div class="button-demo-grid" style="align-items: flex-start">
          <SkySelect
            v-model="selectVal"
            :options="selectOptions"
            placeholder="Оберіть варіант"
          />
          <SkySelect
            v-model="selectVal"
            :options="selectOptions"
            placeholder="Disabled"
            disabled
          />
          <SkySelect
            v-model="selectVal2"
            :options="['Рядок 1', 'Рядок 2', 'Рядок 3']"
            placeholder="Масив рядків"
          />
        </div>
        <div style="margin-top: 8px">
          <SkySelect
            v-model="selectVal"
            :options="selectOptions"
            placeholder="Block (full width)"
            block
          />
        </div>
        <p class="section-desc" style="margin-top: 8px">
          Обране: <strong>{{ selectVal ?? '—' }}</strong>
        </p>

        <h3 class="section-title">SkyCheckboxFilter (feature)</h3>
        <p class="section-desc">
          Кнопка-фільтр з дропдауном (мульти-вибір через <code>SkyCheckbox</code>). Стилі 1:1 з адмінкою skymarket.
        </p>
        <div style="display: flex; gap: 5px; flex-wrap: wrap; align-items: flex-start">
          <SkyCheckboxFilter
            v-model="filterCategories"
            title="Категорії"
            :options="categoryOptions"
          />
          <SkyCheckboxFilter
            v-model="filterStatus"
            title="Статус"
            :options="statusOptions"
          />
          <SkyCheckboxFilter
            v-model="filterEmpty"
            title="Disabled"
            :options="categoryOptions"
            disabled
          />
        </div>
        <p class="section-desc" style="margin-top: 8px">
          Обрано категорій: <strong>{{ filterCategories.length }}</strong> ·
          статусів: <strong>{{ filterStatus.length }}</strong>
        </p>

        <h3 class="section-title">SkyLoader</h3>
        <p class="section-desc">
          Фірмовий лоадер з двома кільцями. <code>position: absolute</code> + <code>z-index: 20000</code>,
          центрується відносно найближчого позиціонованого батька.
        </p>
        <div class="sky-loader-demo-grid">
          <div class="sky-loader-demo-box">
            <SkyLoader />
            <span class="sky-loader-demo-label">Без підпису</span>
          </div>
          <div class="sky-loader-demo-box">
            <SkyLoader text="Завантаження..." />
            <span class="sky-loader-demo-label">З підписом</span>
          </div>
          <div class="sky-loader-demo-box sky-loader-demo-box--dark">
            <SkyLoader text="Темний фон" />
            <span class="sky-loader-demo-label" style="color: #fff">На темному фоні</span>
          </div>
        </div>

        <h3 class="section-title">SkyTileCard (widget)</h3>
        <p class="section-desc">
          Проста картка: обовʼязковий <code>title</code>, опціональний <code>subtitle</code>,
          опціональний <code>imageUrl</code> або слот <code>#icon</code> (фон іконки = primary).
        </p>

        <div class="sky-tile-demo-grid">
          <SkyTileCard title="Без іконки" subtitle="Тільки title + subtitle" />

          <SkyTileCard title="З imageUrl" subtitle="Завантажує по URL" image-url="/img.svg" />

          <SkyTileCard title="Без subtitle">
            <template #icon>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" fill="currentColor"/>
              </svg>
            </template>
          </SkyTileCard>

          <SkyTileCard title="Slot-іконка" subtitle="Повна композиція">
            <template #icon>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
            </template>
          </SkyTileCard>
        </div>

        <h3 class="section-title">SkyCard</h3>
        <p class="section-desc">
          Композиційний card: <code>SkyCard</code> (shell зі слотами ribbon / header / default / footer) +
          <code>SkyCardHeader</code> (іконка + title + subtitle) +
          <code>SkyCardRow</code> (label + value) + <code>SkyBadge</code> (статусна pill) +
          <code>SkyAlert</code> (inline alert). Паддінги адаптивні (1180-1430 / 500).
        </p>

        <div class="sky-card-demo-grid">
          <SkyCard>
            <template #ribbon>Тимчасово закрито</template>
            <template #header>
              <SkyCardHeader
                title="Торгова точка 1"
                subtitle="вул. Гетьмана Сильного, 128"
              >
                <template #icon>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                  </svg>
                </template>
              </SkyCardHeader>
            </template>

            <SkyCardRow label="Store Address ID" value="902062" />
            <SkyCardRow label="Статус інтеграції">
              <SkyBadge tone="success" label="Під'єднано" />
            </SkyCardRow>

            <template #footer>
              <SkyButton variant="primary" block>Налаштувати меню</SkyButton>
              <SkyButton variant="secondary">Змінити ID</SkyButton>
            </template>
          </SkyCard>

          <SkyCard>
            <template #header>
              <SkyCardHeader title="Торгова точка 2" subtitle="вул. Тиха, 45" />
            </template>

            <SkyCardRow label="Store Address ID" value="—" />
            <SkyCardRow label="Статус інтеграції">
              <SkyBadge tone="error" label="Помилка" />
            </SkyCardRow>
            <SkyAlert tone="error">Невалідний storeAddressId</SkyAlert>

            <template #footer>
              <SkyButton variant="primary" block>Під'єднати</SkyButton>
            </template>
          </SkyCard>

          <SkyCard>
            <template #header>
              <SkyCardHeader title="Торгова точка 3" subtitle="Адреса не вказана" />
            </template>

            <SkyCardRow label="Store Address ID" value="438291" />
            <SkyCardRow label="Статус інтеграції">
              <SkyBadge tone="pending" label="Очікування" />
            </SkyCardRow>

            <template #footer>
              <SkyButton variant="primary" block>Під'єднати</SkyButton>
            </template>
          </SkyCard>
        </div>

        <h3 class="section-title">Modal (Sized)</h3>
        <p class="section-desc">Centered modal with custom width/height. Closes on overlay click or Esc.</p>
        <button class="demo-btn" @click="showHomeModalSized = true">Open Sized Modal</button>
        <Modal v-model="showHomeModalSized" title="Sized Modal" width="500px" height="300px">
          <div style="padding: 16px">
            <p>A compact modal with fixed dimensions.</p>
          </div>
          <template #footer>
            <button class="demo-btn" @click="showHomeModalSized = false">Done</button>
          </template>
        </Modal>

        <h3 class="section-title">Modal (Footer states)</h3>
        <p class="section-desc">
          Footer renders only if <code>#footer</code> slot is passed. Gap between elements = 14px.
        </p>
        <div class="button-demo-grid">
          <button class="demo-btn" @click="showModalFooterMany = true">Multiple buttons</button>
          <button class="demo-btn" @click="showModalFooterOne = true">One button</button>
          <button class="demo-btn" @click="showModalFooterNone = true">No footer</button>
        </div>
        <Modal v-model="showModalFooterMany" title="Footer — multiple" width="500px" height="260px">
          <div style="padding: 16px">
            <p>Three buttons in the footer — spaced with 14px gap.</p>
          </div>
          <template #footer>
            <button class="demo-btn" @click="showModalFooterMany = false">Cancel</button>
            <button class="demo-btn" @click="showModalFooterMany = false">Save draft</button>
            <button class="demo-btn primary" @click="showModalFooterMany = false">Confirm</button>
          </template>
        </Modal>
        <Modal v-model="showModalFooterOne" title="Footer — one" width="500px" height="260px">
          <div style="padding: 16px">
            <p>Single button — footer is still rendered.</p>
          </div>
          <template #footer>
            <button class="demo-btn primary" @click="showModalFooterOne = false">OK</button>
          </template>
        </Modal>
        <Modal v-model="showModalFooterNone" title="Footer — none" width="500px" height="260px">
          <div style="padding: 16px">
            <p>No <code>#footer</code> slot passed — footer block is not rendered at all.</p>
          </div>
        </Modal>
      </div>
    </template>

    <!-- Page: Products -->
    <template v-if="page === 'products'">
      <Header
        title="Products"
        subtitle="Manage your product catalog"
        :back-event="() => navigate('home')"
        :dropdown-items="recentPages"
        @navigate="navigate"
      >
        <button class="demo-btn primary" @click="showDialog = true">+ Add</button>
      </Header>
      <div class="page-content">
        <table class="demo-table">
          <thead>
            <tr><th>Name</th><th>Price</th><th>Stock</th></tr>
          </thead>
          <tbody>
            <tr v-for="i in 8" :key="i">
              <td>Product {{ i }}</td>
              <td>{{ (i * 12.5).toFixed(2) }} UAH</td>
              <td>{{ i * 7 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Dialog v-model="showDialog" mode="next" title="New Product" subtitle="Add to catalog">
        <div style="padding: 20px">
          <label class="demo-label">Name</label>
          <input class="demo-input" placeholder="Product name" />
          <label class="demo-label">Price</label>
          <input class="demo-input" type="number" placeholder="0.00" />
        </div>
        <template #buttons>
          <button class="demo-btn" @click="showDialog = false">Cancel</button>
          <button class="demo-btn primary" @click="showDialog = false">Save</button>
        </template>
      </Dialog>
    </template>

    <!-- Page: Orders -->
    <template v-if="page === 'orders'">
      <Header
        title="Orders"
        subtitle="Recent orders"
        :back-event="() => navigate('home')"
        :dropdown-items="recentPages"
        @navigate="navigate"
      >
        <button class="demo-btn" @click="showDialogClassic = true">Export</button>
        <button class="demo-btn primary" @click="showDialogNext = true">+ New order</button>
      </Header>
      <div class="page-content">
        <div class="demo-list">
          <div v-for="i in 6" :key="i" class="demo-list-item">
            <div>
              <strong>Order #{{ 1000 + i }}</strong>
              <div class="text-muted">Customer {{ i }}</div>
            </div>
            <span :class="['status', i % 3 === 0 ? 'status-done' : i % 3 === 1 ? 'status-pending' : 'status-new']">
              {{ i % 3 === 0 ? 'Done' : i % 3 === 1 ? 'Pending' : 'New' }}
            </span>
          </div>
        </div>
      </div>
      <Dialog v-model="showDialogClassic" mode="classic" title="Export Orders" subtitle="Download as file">
        <div style="padding: 20px">
          <p>Choose export format:</p>
          <div style="display: flex; gap: 8px; margin-top: 12px">
            <button class="demo-btn" @click="showDialogClassic = false">CSV</button>
            <button class="demo-btn" @click="showDialogClassic = false">Excel</button>
          </div>
        </div>
        <template #buttons>
          <button class="demo-btn" @click="showDialogClassic = false">Close</button>
        </template>
      </Dialog>
      <Dialog v-model="showDialogNext" mode="next" title="New Order">
        <div style="padding: 20px">
          <label class="demo-label">Customer</label>
          <input class="demo-input" placeholder="Customer name" />
          <label class="demo-label">Notes</label>
          <textarea class="demo-input" rows="3" placeholder="Order notes"></textarea>
        </div>
        <template #buttons>
          <button class="demo-btn" @click="showDialogNext = false">Cancel</button>
          <button class="demo-btn primary" @click="showDialogNext = false">Create</button>
        </template>
      </Dialog>
    </template>

    <!-- Page: Settings -->
    <template v-if="page === 'settings'">
      <Header
        title="Settings"
        subtitle="Application preferences"
        :back-event="() => navigate('home')"
        :dropdown-items="recentPages"
        @navigate="navigate"
      >
        <button class="demo-btn" @click="showSettingsModal = true">About</button>
        <button class="demo-btn primary" @click="navigate('settings-profile')">Profile</button>
      </Header>
      <div class="page-content">
        <div class="nav-grid">
          <div class="nav-card" @click="navigate('settings-profile')">
            <div class="nav-card-title">Profile</div>
            <div class="nav-card-desc">User info and avatar</div>
          </div>
          <div class="nav-card" @click="navigate('settings-notifications')">
            <div class="nav-card-title">Notifications</div>
            <div class="nav-card-desc">Email and push settings</div>
          </div>
        </div>
      </div>
      <Modal v-model="showSettingsModal" title="About" subtitle="Application info" width="500px" height="300px">
        <div style="padding: 16px">
          <p><strong>Vue Dev Kit</strong></p>
          <p style="color: #888; margin-top: 4px">Version 1.2.0</p>
          <p style="margin-top: 12px">A shared component library for Skyservice microservices.</p>
        </div>
        <template #footer>
          <button class="demo-btn" @click="showSettingsModal = false">Close</button>
        </template>
      </Modal>
    </template>

    <!-- Page: Settings > Profile (nested) -->
    <template v-if="page === 'settings-profile'">
      <Header
        title="Profile"
        subtitle="Edit your profile"
        :back-event="() => navigate('settings')"
        :dropdown-items="recentPages"
        @navigate="navigate"
      >
        <button class="demo-btn primary" @click="showProfileDialog = true">Edit</button>
      </Header>
      <div class="page-content">
        <div class="demo-list">
          <div class="demo-list-item">
            <span class="text-muted">Name</span>
            <strong>John Doe</strong>
          </div>
          <div class="demo-list-item">
            <span class="text-muted">Email</span>
            <strong>john@example.com</strong>
          </div>
          <div class="demo-list-item">
            <span class="text-muted">Phone</span>
            <strong>+380 99 123 4567</strong>
          </div>
        </div>
      </div>
      <Dialog v-model="showProfileDialog" mode="next" title="Edit Profile" subtitle="Update your info">
        <div style="padding: 20px">
          <label class="demo-label">Name</label>
          <input class="demo-input" value="John Doe" />
          <label class="demo-label">Email</label>
          <input class="demo-input" value="john@example.com" />
          <label class="demo-label">Phone</label>
          <input class="demo-input" value="+380 99 123 4567" />
        </div>
        <template #buttons>
          <button class="demo-btn" @click="showProfileDialog = false">Cancel</button>
          <button class="demo-btn primary" @click="showProfileDialog = false">Save</button>
        </template>
      </Dialog>
    </template>

    <!-- Page: Settings > Notifications (nested) -->
    <template v-if="page === 'settings-notifications'">
      <Header
        title="Notifications"
        subtitle="Manage notification preferences"
        :back-event="() => navigate('settings')"
        :dropdown-items="recentPages"
        @navigate="navigate"
      >
        <button class="demo-btn" @click="showNotifyModal = true">Preview</button>
      </Header>
      <div class="page-content">
        <div class="demo-list">
          <div class="demo-list-item">
            <span>Email notifications</span>
            <input type="checkbox" checked />
          </div>
          <div class="demo-list-item">
            <span>Push notifications</span>
            <input type="checkbox" />
          </div>
          <div class="demo-list-item">
            <span>SMS notifications</span>
            <input type="checkbox" />
          </div>
        </div>
      </div>
      <Modal v-model="showNotifyModal" title="Notification Preview" width="500px" height="350px">
        <div style="padding: 16px">
          <div class="demo-list">
            <div class="demo-list-item">
              <div>
                <strong>Order #1005 confirmed</strong>
                <div class="text-muted">2 minutes ago</div>
              </div>
              <span class="status status-new">New</span>
            </div>
            <div class="demo-list-item">
              <div>
                <strong>Payment received</strong>
                <div class="text-muted">15 minutes ago</div>
              </div>
              <span class="status status-done">Read</span>
            </div>
            <div class="demo-list-item">
              <div>
                <strong>Low stock: Product 3</strong>
                <div class="text-muted">1 hour ago</div>
              </div>
              <span class="status status-pending">Warning</span>
            </div>
          </div>
        </div>
        <template #footer>
          <button class="demo-btn" @click="showNotifyModal = false">Close</button>
        </template>
      </Modal>
    </template>

    <!-- Page: Reports -->
    <template v-if="page === 'reports'">
      <Header
        title="Reports"
        subtitle="Analytics and stats"
        :back-event="() => navigate('home')"
        :dropdown-items="recentPages"
        @navigate="navigate"
      >
        <button class="demo-btn" @click="showModal = true">Full Report</button>
        <button class="demo-btn" @click="showModalSized = true">Quick View</button>
      </Header>
      <div class="page-content">
        <p>Click the buttons above to see Modal examples.</p>
      </div>
      <Modal v-model="showModal" title="Full Report" subtitle="Monthly analytics">
        <div style="padding: 16px">
          <p v-for="i in 20" :key="i">Report line {{ i }} — data placeholder</p>
        </div>
        <template #footer>
          <button class="demo-btn" @click="showModal = false">Close</button>
        </template>
      </Modal>
      <Modal v-model="showModalSized" title="Quick View" width="600px" height="400px">
        <div style="padding: 16px">
          <p>Summary stats go here.</p>
        </div>
        <template #footer>
          <button class="demo-btn" @click="showModalSized = false">Done</button>
        </template>
      </Modal>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Header, Dialog, Modal, SkyButton, SkySelect, SkyCard, SkyCardHeader, SkyCardRow, SkyBadge, SkyAlert, SkyLoader, SkyTileCard, SkyCheckboxFilter } from '../src'

const page = ref('home')

const showDialog = ref(false)
const showDialogClassic = ref(false)
const showDialogNext = ref(false)
const showModal = ref(false)
const showModalSized = ref(false)
const showSettingsModal = ref(false)
const showProfileDialog = ref(false)
const showNotifyModal = ref(false)
const showHomeDialogNext = ref(false)
const showHomeDialogClassic = ref(false)
const showHomeModal = ref(false)
const showHomeModalSized = ref(false)
const showModalFooterMany = ref(false)
const showModalFooterOne = ref(false)
const showModalFooterNone = ref(false)
const btnLoading = ref(false)

const selectVal = ref(null)
const selectVal2 = ref(null)
const filterCategories = ref([])
const filterStatus = ref([])
const filterEmpty = ref([])
const categoryOptions = [
  { value: 'alc', name: 'Алкоголь' },
  { value: 'food', name: 'Їжа' },
  { value: 'drink', name: 'Напої' },
  { value: 'snack', name: 'Снеки' },
  { value: 'sweet', name: 'Солодощі' },
  { value: 'frozen', name: 'Заморозка' },
]
const statusOptions = [
  { value: 'active', name: 'Активний' },
  { value: 'paused', name: 'Призупинений' },
  { value: 'archived', name: 'Архівний' },
]
const selectOptions = [
  { label: 'Варіант 1', value: 1 },
  { label: 'Варіант 2', value: 2 },
  { label: 'Варіант 3', value: 3 },
  { label: 'Варіант 4', value: 4 },
  { label: 'Варіант 5', value: 5 },
]

// Page names for the dropdown
const pageNames = {
  home: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  settings: 'Settings',
  'settings-profile': 'Profile',
  'settings-notifications': 'Notifications',
  reports: 'Reports',
}

// Read/write componentStats from localStorage — same as dashboard
function getStats() {
  try {
    return JSON.parse(localStorage.componentStats || '{}').pages || {}
  } catch {
    return {}
  }
}

function saveStats(pages) {
  try {
    const stats = JSON.parse(localStorage.componentStats || '{}')
    stats.pages = pages
    localStorage.componentStats = JSON.stringify(stats)
  } catch {
    localStorage.componentStats = JSON.stringify({ pages })
  }
}

function trackVisit(pageName) {
  const pages = getStats()
  pages[pageName] = {
    name: pageNames[pageName] || pageName,
    path: pageName,
    lastVisit: Date.now(),
  }
  saveStats(pages)
  // Trigger reactivity
  statsVersion.value++
}

const statsVersion = ref(0)

const recentPages = computed(() => {
  // eslint-disable-next-line no-unused-vars
  const _ = statsVersion.value // trigger reactivity
  const pages = getStats()
  return Object.values(pages)
})

function navigate(target) {
  page.value = target
  window.location.hash = target
  window.scrollTo(0, 0)
  trackVisit(target)
}

function onHashChange() {
  const hash = window.location.hash.slice(1)
  if (hash) {
    page.value = hash
    trackVisit(hash)
  } else {
    page.value = 'home'
  }
}

onMounted(() => {
  window.addEventListener('hashchange', onHashChange)
  onHashChange()
})

onUnmounted(() => {
  window.removeEventListener('hashchange', onHashChange)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #f5f5f5;
}

.page-content {
  padding: 20px;
  max-width: 900px;
}

.page-content h2 {
  margin-bottom: 16px;
  font-size: 18px;
  color: #555;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 4px;
}

.section-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

/* Navigation cards */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.nav-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.nav-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.nav-card-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.nav-card-desc {
  font-size: 13px;
  color: #888;
}

/* Table */
.demo-table {
  width: 100%;
  border-collapse: collapse;
}

.demo-table th,
.demo-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.demo-table th {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

/* List */
.demo-list {
  display: flex;
  flex-direction: column;
}

.demo-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.text-muted {
  font-size: 13px;
  color: #888;
}

.status {
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 12px;
}

.status-new { background: #dbeafe; color: #1e40af; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-done { background: #d1fae5; color: #065f46; }

/* Form elements */
.demo-label {
  display: block;
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
  margin-top: 12px;
}

.demo-label:first-child {
  margin-top: 0;
}

.demo-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

/* Button demo grid */
.button-demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.sky-card-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.sky-tile-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.sky-loader-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.sky-loader-demo-box {
  position: relative;
  height: 240px;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.sky-loader-demo-box--dark {
  background: #1f2937;
  border-color: #374151;
}

.sky-loader-demo-label {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

/* Buttons */
.demo-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.demo-btn:hover {
  background: #f0f0f0;
}

.demo-btn.primary {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.demo-btn.primary:hover {
  background: #4338ca;
}
</style>
