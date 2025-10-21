<template>
  <v-app>
    <v-main>
      <suspense><TypesAffaireListeChoix @choixTypeAffaire="receptionTypeAffaire"></TypesAffaireListeChoix></suspense>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import TypesAffaireListeChoix from './components/TypesAffaireListeChoix.vue';

const receptionTypeAffaire = (id: number, jsonData: string) => {
  console.log(jsonData)
}

</script>
