# SkyLoader

Фірмовий лоадер: дві кільцеві анімації навколо літери «S», опціональний підпис.

## Демо

<ClientOnly>
  <SkyLoaderDemo />
</ClientOnly>

::: warning Потрібен позиціонований батько
`SkyLoader` має `position: absolute` + `z-index: 20000` і центрується відносно **найближчого позиціонованого батька**. Обгортайте його в контейнер із `position: relative`, інакше він спозиціонується відносно viewport.
:::

## Приклад

```vue
<script setup>
import { SkyLoader } from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <!-- У позиціонованому контейнері -->
  <div style="position: relative; min-height: 300px;">
    <SkyLoader text="Завантаження..." />
  </div>

  <!-- Без підпису -->
  <SkyLoader />
</template>
```

## Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `text` | `String` | ні | Підпис під лоадером |

## Патерн: оверлей завантаження

Показуйте лоадер поверх контенту, поки вантажаться дані:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { SkyLoader } from '@skyservice-developers/vue-dev-kit'

const loading = ref(true)
const items = ref([])

onMounted(async () => {
  items.value = await fetchItems()
  loading.value = false
})
</script>

<template>
  <div style="position: relative; min-height: 240px;">
    <SkyLoader v-if="loading" text="Завантаження товарів…" />
    <ul v-else>
      <li v-for="i in items" :key="i.id">{{ i.name }}</li>
    </ul>
  </div>
</template>
```

## На темному фоні

Лоадер розрахований і на світлий, і на темний фон — кільця та літера лишаються контрастними.

## z-index

`z-index: 20000` навмисно високий, щоб лоадер перекривав контент. Якщо він конфліктує з іншими шарами (напр. власними оверлеями) — контролюйте контекст нашарування через позиціонований контейнер, у якому він лежить.
