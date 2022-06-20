<template>
  <div class="dropbox">
    <div class="dropbox-inner ">
      <input type="file" name="file" class="input-file"
             @change="onFileChange($event.target, $event.target.files[0])"
             accept=".ini,.txt">
      <div class="upload-text uk-flex uk-flex-middle uk-flex-center">
        <p>
          Drag your file here to begin<br> or click to browse
        </p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "FileUpload",
  emits: ["file-change"],
  methods: {
    onFileChange(target, file) {
      this.$emit('file-change', {fieldname: target.name, file})
    }
  }
}
</script>

<style lang="less">
@import "@/assets/styles/variables.less";

@borderWidth: 2px;
@borderRadius: 4px;

.dropbox {
  position: relative;
  width: 80%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  height: 200px;
  padding: 5px;
  border-radius: @borderRadius*0.75;
  z-index: 1;
}

.dropbox::after {
  position: absolute;
  content: "";
  background: linear-gradient(60deg,
  hsl(224, 85%, 66%),
  hsl(269, 85%, 66%),
  hsl(314, 85%, 66%),
  hsl(359, 85%, 66%),
  hsl(44, 85%, 66%),
  hsl(89, 85%, 66%),
  hsl(134, 85%, 66%),
  hsl(179, 85%, 66%));
  background-size: 300% 300%;
  background-position: 0 50%;
  border-radius: @borderRadius;
  z-index: -1;
  top: calc(-1 * @borderWidth);
  left: calc(-1 * @borderWidth);
  width: calc(100% + @borderWidth * 2);
  height: calc(100% + @borderWidth * 2);
  animation: moveGradient 4s alternate infinite;
  opacity: 0;
  transition: all .3s ease-in-out;
}

@keyframes moveGradient {
  50% {
    background-position: 100% 50%;
  }
}


.dropbox .input-file {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
}

.dropbox div.upload-text {
  font-size: 1.5rem;
  color: @global-color;
  text-align: center;
  transition: all .3s ease-in-out;
  z-index: 1;
  background: @global-primary-background;
  position: absolute;
  inset: 0;
}

div.upload-text p {
  margin: 0;
}

.dropbox:hover div.upload-text {
  color: @global-inverse-color;
  transition: all .3s ease-in-out;
}

.dropbox:hover::after {
  opacity: 1;
  transition: all .3s ease-in-out;
}
</style>