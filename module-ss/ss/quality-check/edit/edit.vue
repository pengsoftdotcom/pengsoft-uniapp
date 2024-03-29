<template>
    <view class="w-form-wrap">
        <u--form :labelWidth="80" :model="formModel" ref="form">
            <u-form-item label="项　　目" prop="project.shortName" borderBottom>
                {{
                    formModel.project.shortName
                        ? formModel.project.shortName
                        : ''
                }}
            </u-form-item>
            <u-form-item label="检查编码" prop="code" borderBottom>
                {{ formModel.code ? formModel.code : '' }}
            </u-form-item>
            <u-form-item
                label="检 查 人"
                prop="checker.person.name"
                borderBottom
            >
                {{
                    formModel.checker.person.name
                        ? formModel.checker.person.name
                        : ''
                }}
            </u-form-item>
            <u-form-item label="检查图片" prop="submitFiles" borderBottom>
                <u-upload
                    :capture="['camera']"
                    :fileList="submitFiles"
                    @afterRead="afterReadSubmitPicture()"
                    @delete="deletePicture"
                    :deletable="!isSubmitDisabled()"
                    :disabled="isSubmitDisabled()"
                >
                </u-upload>
            </u-form-item>
            <u-form-item label="检查描述" prop="reason" borderBottom>
                <u--textarea
                    v-model="formModel.reason"
                    :disabled="isSubmitDisabled()"
                ></u--textarea>
            </u-form-item>
            <u-form-item
                v-if="formModel.submittedAt && formModel.status.code === 'risk'"
                label="整改图片"
                prop="handleFiles"
                borderBottom
            >
                <u-upload
                    :capture="['camera']"
                    :fileList="handleFiles"
                    @afterRead="afterReadHandlePicture()"
                    @delete="deletePicture"
                    :deletable="!isHandleDisabled()"
                    :disabled="isHandleDisabled()"
                >
                </u-upload>
            </u-form-item>
            <u-form-item
                v-if="formModel.submittedAt && formModel.status.code === 'risk'"
                label="整改结果"
                prop="result"
                borderBottom
            >
                <u--textarea
                    v-model="formModel.result"
                    :disabled="isHandleDisabled()"
                ></u--textarea>
            </u-form-item>
        </u--form>
        <view class="w-form-btn-content">
            <u-button
                v-if="isSubmitVisible()"
                :disabled="isSubmitDisabled()"
                type="success"
                text="安全"
                @click="submit"
            >
            </u-button>
            <u-button
                v-if="isSubmitVisible()"
                :disabled="isSubmitDisabled()"
                type="error"
                text="隐患"
                @click="risk"
            >
            </u-button>
            <u-button
                v-if="isHandleVisible()"
                :disabled="isHandleDisabled()"
                type="primary"
                text="整改"
                @click="handle"
            >
            </u-button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            titleObj: {
                create: '新增质量检查',
                update: '编辑质量检查',
                detail: '质量检查详情'
            },
            type: '',
            formModel: {
                id: ''
            },
            typeArr: [],
            statusArr: [],
            submitFiles: [],
            handleFiles: [],
            rules: {
                submitFiles: {
                    type: 'array',
                    required: true,
                    message: '请上传检查图片'
                },
                reason: {
                    type: 'string',
                    required: true,
                    message: '请填写描述'
                }
            }
        };
    },
    onLoad(option) {
        uni.getDictionaryItem(
            'quality_check_status',
            (data) => (this.statusArr = data)
        );
        this.formModel.id = option.id;
        if (this.formModel.id) {
            this.type = 'detail';
        } else {
            this.type = 'create';
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
        setType() {
            this.formModel.type = this.typeArr.find(
                (type) => (type.id = this.formModel.type.id)
            );
        },
        findOne() {
            uni.request({
                url: '/api/ss/quality-check/find-one-with-files',
                data: {
                    id: this.formModel.id
                },
                success: (res) => {
                    this.formModel = res.data;
                    if (this.formModel.submitFiles) {
                        this.submitFiles = this.formModel.submitFiles.map(
                            (file) => uni.convertToFile(file)
                        );
                    }
                    if (this.formModel.handleFiles) {
                        this.handleFiles = this.formModel.handleFiles.map(
                            (file) => uni.convertToFile(file)
                        );
                    }
                }
            });
        },
        isSubmitVisible() {
            return uni.hasAnyAuthority('ss::quality_check::submit');
        },
        isSubmitDisabled() {
            return this.formModel.submittedAt;
        },
        safe() {
            this.formModel.status = this.statusArr.find(
                (status) => status.code === 'safe'
            );
            this.submit();
        },
        risk() {
            this.formModel.status = this.statusArr.find(
                (status) => status.code === 'risk'
            );
            this.submit();
        },
        submit() {
            this.formModel.status = this.statusArr.find(
                (status) => status.id === this.formModel.status.id
            );
            this.$refs.form
                .validate()
                .then(() => {
                    let url = '/api/ss/quality-check/submit?';
                    if (this.submitFiles) {
                        this.submitFiles.forEach(
                            (file) => (url += 'asset.id=' + file.id + '&')
                        );
                        url = url.substring(0, url.length - 1);
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
                                title: '提交成功',
                                success: () => {
                                    uni.navigateBack();
                                }
                            })
                    });
                })
                .catch(() =>
                    uni.showToast({
                        title: '请完成填写后提交',
                        icon: 'none'
                    })
                );
        },
        isHandleVisible() {
            return uni.hasAnyAuthority('ss::quality_check::handle');
        },
        isHandleDisabled() {
            return (
                !this.formModel.submittedAt ||
                this.formModel.handledAt ||
                this.formModel.status.code === 'safe'
            );
        },
        handle() {
            if (
                !this.formModel.handleFiles ||
                this.formModel.handleFiles.length === 0
            ) {
                uni.showToast({
                    title: '请上传整改图片',
                    icon: 'none'
                });
                return;
            }
            if (!this.formModel.result) {
                uni.showToast({
                    title: '请填写整改结果',
                    icon: 'none'
                });
                return;
            }
            uni.request({
                url: `/api/ss/safety-check/handle?id=${this.formModel.id}`,
                method: 'PUT',
                data: {
                    'asset.id': this.handleFiles
                        .map((file) => file.id)
                        .join(','),
                    result: this.formModel.result
                },
                success: () =>
                    uni.showModal({
                        title: '整改成功',
                        success: () => {
                            uni.navigateBack();
                        }
                    })
            });
        },
        async afterReadSubmitPicture(event) {
            if (!this.formModel.submitFiles) {
                this.formModel.submitFiles = [];
            }
            uni.afterReadFile(
                event,
                false,
                this.formModel.submitFiles,
                this.submitFiles
            );
        },
        async afterReadHandlePicture(event) {
            if (!this.formModel.handleFiles) {
                this.formModel.handleFiles = [];
            }
            uni.afterReadFile(
                event,
                false,
                this.formModel.handleFiles,
                this.handleFiles
            );
        },
        deletePicture(event) {
            return new Promise((resolve) => {
                uni.request({
                    url: '/api/ss/quality-check/delete-file-by-asset',
                    method: 'DELETE',
                    data: {
                        id: this.formModel.id,
                        'asset.id': event.file.id
                    },
                    success: () => {
                        this.submitFiles.splice(event.index, 1);
                        resolve();
                    }
                });
            });
        }
    }
};
</script>

<style lang="scss">
page {
    background: #fff;
}
</style>
