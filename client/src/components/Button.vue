<template>
  <div>
    <div class="uk-width-1-1">
      <div class="uk-button uk-width-1-1" :class="[buttonCls, {'uk-disabled': disabled}]" @click="$emit('button-clicked')">
        <font-awesome-icon class="icon" :icon="btnIcon"/>
        <span class="uk-margin-small-left">{{btnLabel}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Button",
  emits: ["button-clicked"],
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    btnLabel: {
      type: String,
      required: false,
      default: "Button"
    },
    btnIcon: {
      type: String,
      required: false,
      default: "play"
    },
    buttonCls: {
      type: String,
      required: false,
      default: "uk-button-secondary"
    }
  },
}
</script>