<template>
  <div
    class="item-default"
    :style="!params.style ? `flex: ${widthFlex};` : params.style(item[params['name']], item) + `flex: ${widthFlex};`"
    :class="{
      negativeQuantity: params.name === 'quantity' && +item[params.name] < 0,
      minQuantity: params.name === 'quantity' && +item[params.name] > 0 && +item[params.name] < item['min_quantity'],
    }"
    @click="emit('open')"
  >
    <slot :item="item" :value="item[params.name]">
    <template v-if="params.name == 'logo'">
      <div
        class="productAppereanceBlock"
        style="flex-shrink: 0"
        :style="getProductAppearanceStyle()"
      >
        <template v-if="item[params.activeAppearance] == 0">
          <span class="productAppereanceBlock__productName">{{ nameShortening }}</span>
        </template>
        <template v-else-if="item[params.activeAppearance] == 2">
          <span class="productAppereanceBlock__productName_onlyText">{{ item[name] }}</span>
        </template>
      </div>
      <div v-if="params.description" class="productAppereanceBlock__description">
        {{ item[name] }}
      </div>
    </template>
    <template v-else-if="params.mutate != null">
      <span v-if="params.image" style="cursor: pointer" @click="params.emit ? emit(params.emit, item) : null">
        <img
          class="movement-history"
          :class="{ movementHistoryWhite: params.name === 'quantity' && +item[params.name] < 0 }"
          :src="params.image"
        />
      </span>
      <span
        :style="params.styleChildren ? params.styleChildren(item[params['name']], item) : ''"
        v-html="params.mutate(item[params.name], item) + (currentUnit ? ` (${currentUnit})` : '')"
      />
    </template>

    <span v-else :style="params.styleChildren ? params.styleChildren(item[params['name']], item) : ''">
      {{ item[params.name] }}
    </span>
    </slot>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { lang } from '@/langs';

const props = defineProps({
  index: {
    type: Number,
    default: null,
  },
  params: {
    type: Object,
    default: () => ({}),
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  widthFlex: {
    type: String,
    default: '',
  },
  section: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['open', 'updateRemains']);

const options = [
  { group: 'Quantity', value: 'pcs', text: lang['shtuk'] || 'шт' },
  { group: 'Weight', value: 't', text: lang['unit_t'] || 'т' },
  { group: 'Weight', value: 'kg', text: lang['unit_kg'] || 'кг' },
  { group: 'Weight', value: 'gr', text: lang['unit_gr'] || 'г' },
  { group: 'Volume', value: 'l', text: lang['unit_l'] || 'л' },
  { group: 'Volume', value: 'ml', text: lang['unit_ml'] || 'мл' },
  { group: 'Time', value: 'min', text: lang['unit_min'] || 'хв' },
  { group: 'Meters', value: 'm', text: lang['unit_m'] || 'м' },
  { group: 'Meters', value: 'cm', text: lang['unit_cm'] || 'см' },
  { group: 'Meters', value: 'mm', text: lang['unit_mm'] || 'мм' },
  { group: 'Meters', value: 'm3', text: lang['unit_m3'] || 'м³' },
  { group: 'Meters', value: 'm2', text: lang['unit_m2'] || 'м²' },
  { group: 'Meters', value: 'mp', text: lang['unit_mp'] || 'м.п.' },
];

const currentUnit = computed(() => {
  if (props.params.name === 'type') {
    const selectedUnit = options.find(option => option.value === props.item.unit);
    return selectedUnit ? selectedUnit.text : '';
  }
  return null;
});

const nameShortening = computed(() => {
  const nameArr = props.item[props.name]?.match(/[а-яa-zА-ЯA-Z]+/g);
  if (!nameArr) {
    return props.item[props.name]?.substr(0, 2) || '';
  } else if (nameArr.length === 1) {
    if (nameArr[0].length === 1) {
      return `${nameArr[0][0]}`;
    } else {
      return `${nameArr[0][0]}${nameArr[0][1]}`;
    }
  } else if (nameArr.length > 1) {
    return `${nameArr[0][0]}${nameArr[1][0]}`;
  } else {
    return '';
  }
});

const productLogoUrl = computed(() => {
  if (props.params.name === 'logo' && props.item.logo) {
    return `https://img-1.skyservice.pro/uploads/images/${props.item.logo}`;
  }
  return '';
});

function getProductAppearanceStyle() {
  if (props.item[props.params.activeAppearance] === 0) {
    return `background-color: ${props.item.background}`;
  } else if (props.item[props.params.activeAppearance] === 1) {
    return `background-image: url(${productLogoUrl.value})`;
  } else if (props.item[props.params.activeAppearance] === 3 && props.params.mutate) {
    return `background-image: url(${props.params.mutate(props.item[props.params.name], props.item)})`;
  }
  return 'background: #fff';
}
</script>

<style scoped>
.table-header__name > span {
  text-overflow: ellipsis;
  overflow: hidden;
}

.item-default {
  padding: 0.375rem 1.2rem 0.375rem 0.5rem;
  align-items: center;
  display: flex;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.item-default > span {
  text-overflow: ellipsis;
  overflow: hidden;
}

.productAppereanceBlock {
  width: 54px;
  height: 38px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  overflow: hidden;
  background-size: cover;
  background-position: center center;
}

.productAppereanceBlock__productName {
  text-transform: uppercase;
  font-size: 20px;
  color: #fff;
}

.productAppereanceBlock__productName_onlyText {
  font-size: 10px;
  max-height: 100%;
  line-height: 10px;
  text-align: center;
  width: calc(100% - 5px);
  word-wrap: normal;
  overflow: hidden;
}

.productAppereanceBlock__description {
  padding-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-default.productFoto {
  padding: 5px 5px 5px 0.5rem;
  min-width: 67px;
}

.negativeQuantity {
  background-color: rgb(255, 111, 114) !important;
  color: white;
}

.minQuantity {
  background-color: rgba(255, 232, 22, 0.6) !important;
  color: #212529;
}

.movement-history {
  width: 20px;
  margin-right: 5px;
  border-radius: 100%;
  padding: 1px;
}

.movementHistoryWhite {
  filter: invert(99%) sepia(95%) saturate(0%) hue-rotate(281deg) brightness(109%) contrast(101%);
}

</style>
