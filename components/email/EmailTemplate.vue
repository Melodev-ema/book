<template>
    <!-- Mail de l'extrait gratuit, aux couleurs de la page d'accueil (atelier nuit).
         Tableaux, bgcolor et styles en ligne : c'est ce que les clients mail respectent. -->
    <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        bgcolor="#1c1f2b"
        style="background-color:#1c1f2b;">
        <tbody>
            <tr>
                <td
                    align="center"
                    style="padding:40px 16px;">
                    <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="max-width:600px;">
                        <tbody>
                            <tr>
                                <td
                                    bgcolor="#252938"
                                    style="background-color:#252938;border:1px solid #343949;border-radius:12px;padding:40px 36px;">
                                    <p :style="kicker">Extrait gratuit</p>
                                    <h1 :style="heading">
                                        Un extrait,<br>
                                        <em style="color:#b7a9ff;">offert.</em>
                                    </h1>
                                    <p :style="body">{{ mail.lead }}</p>
                                    <table
                                        role="presentation"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="margin:0 0 28px;">
                                        <tbody>
                                            <tr>
                                                <td
                                                    bgcolor="#353259"
                                                    style="background-color:#353259;border-radius:8px;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#d6ceff;">
                                                    {{ mail.attachment }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p
                                        v-if="mail.offersLine"
                                        :style="offers">{{ mail.offersLine }}</p>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    align="center"
                                    style="padding:24px 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8fa5;">
                                    {{ mail.footer }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import type {ExcerptMail} from '~/utils/excerptMail';

const sans = 'font-family:Arial,Helvetica,sans-serif;';

export default {
    props: {
        mail: {
            type: Object as PropType<ExcerptMail>,
            required: true,
        },
    },
    data() {
        return {
            kicker: `${sans}margin:0 0 16px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#7fd1b9;`,
            heading: 'font-family:Georgia,\'Times New Roman\',serif;margin:0 0 24px;font-size:34px;line-height:1.15;font-weight:normal;color:#e6e7ee;',
            body: `${sans}margin:0 0 28px;font-size:16px;line-height:1.6;color:#9a9fb4;`,
            offers: `${sans}margin:0;font-size:14px;line-height:1.5;color:#9a9fb4;`,
        };
    },
};
</script>
