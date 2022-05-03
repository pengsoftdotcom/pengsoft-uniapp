<template>
    <view class="w-form-wrap">
        <u--form :labelWidth="80" :model="formModel" ref="form">
            <u-form-item
                label="项　　目"
                prop="project"
                borderBottom
                @click="showProjectPicker"
            >
                <u-picker
                    :show="projectPickerVisible"
                    :columns="[projects]"
                    keyName="shortName"
                    @cancel="hideProjectPicker"
                    @confirm="hideProjectPicker"
                ></u-picker>
                <u--input
                    v-model="formModel.project.shortName"
                    disabled
                    disabledColor="#ffffff"
                    placeholder="请选择"
                    border="none"
                    suffixIcon="arrow-right"
                ></u--input>
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
                    :maxCount="6"
                    :deletable="isSubmitVisible()"
                    :disabled="!isSubmitVisible()"
                >
                </u-upload>
            </u-form-item>
            <u-form-item label="检查描述" prop="reason" borderBottom>
                <u--textarea
                    v-model="formModel.reason"
                    :disabled="!isSubmitVisible()"
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
                    :maxCount="6"
                    :deletable="isHandleVisible()"
                    :disabled="!isHandleVisible()"
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
                    :disabled="!isHandleVisible()"
                ></u--textarea>
            </u-form-item>
        </u--form>
        <view class="w-form-btn-content">
            <u-button
                v-if="isSubmitVisible()"
                type="success"
                text="安全"
                @click="submit"
            >
            </u-button>
            <u-button
                v-if="isSubmitVisible()"
                type="error"
                text="隐患"
                @click="risk"
            >
            </u-button>
            <u-button
                v-if="isHandleVisible()"
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
                create: '新增安全质量检查',
                update: '编辑安全质量检查',
                detail: '安全质量检查详情'
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
                project: [
                    { type: 'object', required: true, message: '请选择项目' }
                ],
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
            },
            projects: [],
            projectPickerVisible: false
        };
    },
    onLoad(option) {
        uni.getDictionaryItem(
            'safety_check_status',
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
        showProjectPicker() {
            this.projectPickerVisible = true;
        },
        hideProjectPicker(event) {
            if (event) {
                this.formModel.project = this.projects[event.indexs[0]];
            }
            this.projectPickerVisible = false;
        },
        getProjects() {
            uni.request({
                url: '/api/ss/construction-project/find-all',
                success: (res) => {
                    this.projects = res.data;
                    if (this.projects.length > 0) {
                        this.formModel.project = this.projects[0];
                    }
                }
            });
        },
        setType() {
            this.formModel.type = this.typeArr.find(
                (type) => (type.id = this.formModel.type.id)
            );
        },
        findOne() {
            uni.request({
                url: '/api/ss/safety-check/find-one-with-files',
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
                    this.getProjects();
                }
            });
        },
        isSubmitVisible() {
            return (
                uni.hasAnyAuthority('ss::safety_check::submit') &&
                !this.formModel.submittedAt
            );
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
                    let url = '/api/ss/safety-check/submit?';
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
            return (
                uni.hasAnyAuthority('ss::safety_check::handle') &&
                this.formModel.submittedAt &&
                !this.formModel.handledAt &&
                this.formModel.status.code !== 'safe' &&
                this.formModel.project.buManager.job.id ===
                    uni.getUserDetails().primaryJob.id
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
            const file = JSON.parse(await uni.upload(event.file, false))[0];
            if (!this.formModel.submitFiles) {
                this.formModel.submitFiles = [];
            }
            this.formModel.submitFiles.push(file);
            this.submitFiles.push(uni.convertToFile(file));
        },
        async afterReadHandlePicture(event) {
            const file = JSON.parse(await uni.upload(event.file, false))[0];
            if (!this.formModel.handleFiles) {
                this.formModel.handleFiles = [];
            }
            this.formModel.handleFiles.push(file);
            this.handleFiles.push(uni.convertToFile(file));
        },
        deletePicture(event) {
            return new Promise((resolve) => {
                uni.request({
                    url: '/api/ss/safety-check/delete-file-by-asset',
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
