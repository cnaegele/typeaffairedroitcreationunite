<template>
  <CallerInfo :ssServer="ssServer" @callerinfo="receptionCallerInfo"></CallerInfo>
  <CallerIsInGroup :ssServer="ssServer" nomgroupe="GoelandManager"
    @calleringroup="receptionCallerInGroupGoelandManager"></CallerIsInGroup>

  <v-app>
    <v-main>
      <v-app-bar color="primary" prominent density="compact" app>
        <v-toolbar-title>Types d'affaire, droits de création par unité</v-toolbar-title>

        <v-spacer></v-spacer>
        <div style="position: absolute; right: 16px;">
          Utilisateur: {{ callerInformation?.prenom }} {{ callerInformation?.nom }} ({{
            callerInformation?.login }}) - {{ callerInformation?.unite }}
        </div>
      </v-app-bar>
      <div v-if="messageErreur != ''" id="divErreur">{{ messageErreur }}</div>
      <div v-if="message != ''" id="divMessage">{{ message }}</div>
      <div v-if="bGoelandManager">
        <suspense>
          <TypesAffaireListeChoix @choixTypeAffaire="receptionTypeAffaire"></TypesAffaireListeChoix>
        </suspense>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { ApiResponseUI, UserInfo } from './CallerInfo.vue'
import type { ApiResponseIG } from './CallerIsInGroup.vue'
import { ref } from 'vue'
import CallerInfo from './CallerInfo.vue';
import CallerIsInGroup from './CallerIsInGroup.vue';
import TypesAffaireListeChoix from './TypesAffaireListeChoix.vue';

const messageErreur = ref<string>('')
const message = ref<string>('')

//Data caller et droits caller
const callerInformation = ref<UserInfo | null | undefined>(null)
const bGoelandManager = ref<boolean>(false)

const ssServer = ref<string>('')
if (import.meta.env.DEV) {
  ssServer.value = 'https://mygolux.lausanne.ch'
}
const receptionTypeAffaire = (id: number, jsonData: string) => {
  console.log(jsonData)
}



const receptionCallerInfo = (jsonData: string) => {
  const retCallerInformation = ref<ApiResponseUI>(JSON.parse(jsonData))
  if (retCallerInformation.value.success) {
    callerInformation.value = retCallerInformation.value.data
  }
}

const receptionCallerInGroupGoelandManager = (jsonData: string) => {
  const retCallerInGroup = ref<ApiResponseIG>(JSON.parse(jsonData))
  if (retCallerInGroup.value.success && retCallerInGroup.value.data !== undefined) {
    bGoelandManager.value = retCallerInGroup.value.data.isingroup
  }
  if (!bGoelandManager.value) {
    messageErreur.value = "Page réservée aux managers goéland"
  }
}  
</script>
