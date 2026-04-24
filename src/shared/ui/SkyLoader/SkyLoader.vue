<template>
  <div class="sky-loader">
    <div v-if="text" class="sky-loader-text">{{ text }}</div>
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="40px"
      height="50px"
      viewBox="0 0 44.96 56.12"
      style="
        enable-background: new 0 0 44.96 56.12;
        fill: #ffffff;
        display: block;
        margin: auto;
        margin-top: 39px;
      "
      xml:space="preserve"
    >
      <path
        d="m0.84382,47.05821l28.6299,0c4.64652,0 4.86634,-4.02966 4.86634,-5.8895c0,-2.16243 -0.51403,-4.63853 -5.01514,-6.10722l-20.36828,-6.73085c-0.80824,-0.23248 -4.05472,-1.39119 -6.12097,-4.02597c-2.36046,-2.94475 -2.65467,-7.19581 -2.65467,-10.21806c0,-3.25103 0.36861,-7.19581 3.3175,-10.06307c2.65467,-2.6237 5.97893,-3.01855 8.48819,-3.01855l29.73235,0l0,8.12942l-26.41485,0c-1.32565,0 -2.87787,0.07749 -4.05472,1.23989c-1.25463,1.2362 -1.32565,3.16985 -1.32565,4.17726c0,2.40229 0.66282,4.71972 4.79194,6.1146l18.88707,6.26958c3.46291,1.1624 5.83014,2.3248 7.3756,3.86729c3.10106,3.09605 3.39528,7.89694 3.39528,10.44685c0,3.40602 -0.44301,7.20319 -2.58028,10.07045c-2.58366,3.48351 -5.83014,3.86729 -9.22203,3.86729l-31.72758,0l0,-8.12942z"
      />
    </svg>
    <div class="sky-loader-double-ring">
      <div />
      <div />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>

<style scoped>
.sky-loader {
  position: absolute;
  z-index: 20000;
  max-width: 200px;
  max-height: 200px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(72, 72, 72, 0.2);
  left: calc(50% - 67px);
  top: calc(50% - 67px);
}

.sky-loader-text {
  width: 200px;
  position: absolute;
  top: 140px;
  left: -34px;
  text-align: center;
  color: white;
  font-size: 1rem;
}

@keyframes sky-loader-double-ring {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes sky-loader-double-ring {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes sky-loader-double-ring-reverse {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(-360deg);
    transform: rotate(-360deg);
  }
}
@-webkit-keyframes sky-loader-double-ring-reverse {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(-360deg);
    transform: rotate(-360deg);
  }
}

.sky-loader-double-ring {
  position: absolute;
  top: -11px;
  left: -10px;
}
.sky-loader-double-ring div {
  position: absolute;
  width: 105px;
  height: 105px;
  top: 23px;
  left: 22px;
  border-radius: 50%;
  border: 6px solid #000;
  border-color: #ffffff transparent #ffffff transparent;
  -webkit-animation: sky-loader-double-ring 1s linear infinite;
  animation: sky-loader-double-ring 1s linear infinite;
}
.sky-loader-double-ring div:nth-child(2) {
  width: 90px;
  height: 90px;
  top: 31px;
  left: 30px;
  border-color: transparent #ffffff transparent #ffffff;
  -webkit-animation: sky-loader-double-ring-reverse 1s linear infinite;
  animation: sky-loader-double-ring-reverse 1s linear infinite;
}
.sky-loader-double-ring {
  width: 100px !important;
  height: 100px !important;
  -webkit-transform: translate(-50px, -50px) scale(1) translate(50px, 50px);
  transform: translate(-50px, -50px) scale(1) translate(50px, 50px);
}
</style>
