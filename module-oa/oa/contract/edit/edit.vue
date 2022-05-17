<template>
    <view>
        <view class="w-form-wrap">
            <u--form :labelWidth="80" :model="formModel" ref="form">
                <u-form-item label="乙方" prop="partyB">
                    {{ formModel.partyB.name ? formModel.partyB.name : '' }}
                </u-form-item>
                <u-form-item label="合同图片" prop="pictures">
                    <u-upload
                        :capture="['camera', 'album']"
                        :fileList="pictures"
                        @afterRead="afterReadPicture()"
                        @delete="deletePicture"
                        :maxCount="6"
                        :disabled="!isSaveVisible()"
                    >
                    </u-upload>
                </u-form-item>
                <u-form-item
                    v-if="isSaveVisible()"
                    label="确认图片"
                    prop="confirmPictures"
                >
                    <u-upload
                        :capture="['camera', 'album']"
                        :fileList="confirmPictures"
                        @afterRead="afterReadConfirmPicture()"
                        @delete="deleteConfirmPicture"
                        :maxCount="6"
                        :disabled="!isSaveVisible()"
                    >
                    </u-upload>
                </u-form-item>
                <u-form-item label="确认时间" prop="finishedAt">
                    {{ formModel.confirmedAt ? formModel.confirmedAt : '' }}
                </u-form-item>
            </u--form>
            <view class="w-form-btn-content">
                <u-button
                    v-if="isSaveVisible()"
                    type="primary"
                    text="保存"
                    @click="save"
                >
                </u-button>
                <u-button
                    v-if="isConfirmVisible()"
                    type="primary"
                    text="确认"
                    @click="confirm()"
                >
                </u-button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            titleObj: {
                create: '新增合同',
                update: '编辑合同',
                detail: '合同详情'
            },
            type: '',
            project: '',
            formModel: {
                id: ''
            },
            typeArr: [],
            statusArray: [],
            pictures: [],
            confirmPictures: [],
            rules: {
                pictures: {
                    type: 'array',
                    required: true,
                    message: '请上传合同图片'
                }
            }
        };
    },
    onLoad(option) {
        uni.getDictionaryItem(
            'contract_party_type',
            (data) => (this.typeArr = data)
        );
        uni.getDictionaryItem(
            'contract_status',
            (data) => (this.statusArr = data)
        );
        this.formModel.id = option.id;
        this.type = option.type;
        if (option.project) {
            this.project = option.project;
        }
        this.findOne();
    },
    onReady() {
        uni.setNavigationBarTitle({
            title: this.titleObj[this.type]
        });
        this.$refs.form.setRules(this.rules);
    },
    methods: {
        findOne() {
            let operation = 'find-one-with-party';
            if (uni.hasAnyRole('worker')) {
                operation = 'find-one-of-mine';
            }
            uni.request({
                url: `/api/oa/contract/${operation}`,
                data: {
                    id: this.formModel.id,
                    'project.id': this.project
                },
                success: (res) => {
                    this.formModel = res.data;
                    if (this.formModel.pictures) {
                        this.pictures = this.formModel.pictures.map((file) =>
                            uni.convertToFile(file)
                        );
                    }
                    if (this.formModel.confirmPictures) {
                        this.confirmPictures =
                            this.formModel.confirmPictures.map((file) =>
                                uni.convertToFile(file)
                            );
                    }
                }
            });
        },
        isSaveVisible() {
            return uni.hasAnyAuthority('oa::contract::save');
        },
        save() {
            this.$refs.form
                .validate()
                .then(() => {
                    let url = '/api/oa/contract/save-with-pictures';
                    url += '?picture.id=';
                    if (this.pictures && this.pictures.length > 0) {
                        url += this.pictures.map((file) => file.id).join(',');
                    }
                    url += '&confirmPicture.id=';
                    if (
                        this.confirmPictures &&
                        this.confirmPictures.length > 0
                    ) {
                        url += this.confirmPictures
                            .map((file) => file.id)
                            .join(',');
                    }
                    uni.request({
                        url,
                        method: 'POST',
                        header: {
                            'Content-Type': 'application/json'
                        },
                        data: this.formModel,
                        success: () =>
                            uni.showModal({
                                title: '保存成功',
                                success: () => {
                                    uni.navigateBack();
                                }
                            })
                    });
                })
                .catch(() => this.afterValidated());
        },
        isConfirmVisible() {
            return uni.hasAnyRole('worker');
        },
        confirm() {
            let operation = 'confirm';
            if (uni.hasAnyRole('worker')) {
                operation = 'confirm-mine';
            }
            this.$refs.form
                .validate()
                .then(() => {
                    let url = `/api/oa/contract/${operation}?id=${this.formModel.id}`;
                    uni.request({
                        url,
                        method: 'PUT',
                        success: () =>
                            uni.showModal({
                                title: '确认成功',
                                success: () => {
                                    uni.navigateBack();
                                }
                            })
                    });
                })
                .catch(() => this.afterValidated());
        },
        afterValidated() {
            uni.showToast({
                title: '请完成填写后提交',
                icon: 'none'
            });
        },
        async afterReadPicture(event) {
            const file = JSON.parse(await uni.upload(event.file, true))[0];
            if (!this.formModel.pictures) {
                this.formModel.pictures = [];
            }
            this.formModel.pictures.push(file);
            if (file.locked) {
                file.accessPath = await uni.download(file);
            }
            this.pictures.push(uni.convertToFile(file));
        },
        deletePicture(event) {
            return new Promise((resolve) => {
                uni.request({
                    url: '/api/oa/contract/delete-picture-by-asset',
                    method: 'DELETE',
                    data: {
                        id: this.formModel.id,
                        'asset.id': event.file.id
                    },
                    success: () => {
                        this.pictures.splice(event.index, 1);
                        resolve();
                    }
                });
            });
        },
        async afterReadConfirmPicture(event) {
            const file = JSON.parse(await uni.upload(event.file, true))[0];
            if (!this.formModel.confirmPictures) {
                this.formModel.confirmPictures = [];
            }
            this.formModel.confirmPictures.push(file);
            if (file.locked) {
                file.accessPath = await uni.download(file);
            }
            this.confirmPictures.push(uni.convertToFile(file));
        },
        deleteConfirmPicture(event) {
            return new Promise((resolve) => {
                uni.request({
                    url: '/api/oa/contract/delete-confirm-picture-by-asset',
                    method: 'DELETE',
                    data: {
                        id: this.formModel.id,
                        'asset.id': event.file.id
                    },
                    success: () => {
                        this.confirmPictures.splice(event.index, 1);
                        resolve();
                    }
                });
            });
        }
    }
};
</script>

<style></style>
