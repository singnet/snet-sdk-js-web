import {
    // PaymentMetadataGenerator,
    PrepaidMetadataGenerator,
} from 'snet-sdk-core/utils/metadataUtils';

// export class PaymentMetadataGeneratorWeb extends PaymentMetadataGenerator {
//     constructor() {
//         this.metadataFields = {
//             ...super.metadataFields,
//             signatureBytes: {
//                 header: super.metadataFields.signatureBytes.header,
//                 value: super.metadataFields.signatureBytes.value.toString(
//                     'base64'
//                 ),
//             },
//         };
//     }
// }

export class PrepaidMetadataGeneratorWeb extends PrepaidMetadataGenerator {
    getMetadataFields(metadata) {
        return {
            ...super.getMetadataFields(metadata),
            // prepaidAuthTokenBytes: {
            //     header: super.getMetadataFields(metadata).prepaidAuthTokenBytes
            //         .header,
            //     value: super
            //         .getMetadataFields(metadata)
            //         .prepaidAuthTokenBytes.value.toString('base64'),
            // },
        };
    }
}
