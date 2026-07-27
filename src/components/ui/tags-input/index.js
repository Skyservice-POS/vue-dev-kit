/**
 *@example <template>
 *          <TagsInput v-model="modelValue">
 *              <TagsInputItem v-for="item in modelValue" :key="item" :value="item">
 *                <TagsInputItemText />
 *                <TagsInputItemDelete />
 *              </TagsInputItem>
 *              <TagsInputInput placeholder="Fruits..." />
 *          </TagsInput>
 *          </template>
 *
 *          <script>
 *          import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input';
 *
 *          export default {
 *          components: {
 *              TagsInput,
 *              TagsInputInput,
 *              TagsInputItem,
 *              TagsInputItemDelete,
 *              TagsInputItemText
 *          },
 *          data() {
 *              return {
 *              modelValue: ['Apple', 'Banana']
 *              }
 *          }
 *          }
 *          </script>
 */
import TagsInput from './TagsInput.vue';
import TagsInputInput from './TagsInputInput.vue';
import TagsInputItem from './TagsInputItem.vue';
import TagsInputItemDelete from './TagsInputItemDelete.vue';
import TagsInputItemText from './TagsInputItemText.vue';

export { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText };
