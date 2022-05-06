<template>
    <view class="w-form-wrap">
        <u--form :labelWidth="80" :model="formModel" :rules="rules" ref="form">
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
            <u-form-item label="培训编码" prop="code" borderBottom>
                {{ formModel.code ? formModel.code : '' }}
            </u-form-item>
            <u-form-item label="培训主题" prop="subject" borderBottom>
                <u--input
                    v-model="formModel.subject"
                    border="surround"
                ></u--input>
            </u-form-item>
            <u-form-item
                label="培 训 人"
                prop="trainer.person.name"
                borderBottom
            >
                {{
                    formModel.trainer.person.name
                        ? formModel.trainer.person.name
                        : ''
                }}
            </u-form-item>
            <u-form-item label="全员参加" prop="allWorkers" borderBottom>
                <u-switch
                    v-model="formModel.allWorkers"
                    :disabled="true"
                ></u-switch>
            </u-form-item>
            <u-form-item
                label="预计开始"
                prop="estimatedStartTime"
                borderBottom
                @click="estShow = !formModel.submittedAt"
            >
                <u--input
                    v-model="formModel.estimatedStartTime"
                    disabled
                    disabledColor="#ffffff"
                    placeholder="请选择"
                    border="none"
                    suffixIcon="calendar-fill"
                ></u--input>
            </u-form-item>
            <u-form-item
                label="预计结束"
                prop="estimatedEndTime"
                borderBottom
                @click="eetShow = !formModel.submittedAt"
            >
                <u--input
                    v-model="formModel.estimatedEndTime"
                    disabled
                    disabledColor="#ffffff"
                    placeholder="请选择"
                    border="none"
                    suffixIcon="calendar-fill"
                ></u--input>
            </u-form-item>
            <u-form-item label="培训地址" prop="address" borderBottom>
                <u--textarea v-model="formModel.address"></u--textarea>
            </u-form-item>
            <u-form-item
                v-if="formModel.startedAt"
                label="过程图片"
                prop="files"
                borderBottom
            >
                <u-upload
                    :capture="['camera']"
                    :fileList="files"
                    @afterRead="afterReadPicture()"
                    @delete="deletePicture"
                    :maxCount="6"
                    :deletable="!formModel.endedAt"
                    :disabled="formModel.endedAt"
                >
                </u-upload>
            </u-form-item>
        </u--form>

        <u-datetime-picker
            closeOnClickOverlay
            :show="estShow"
            mode="datetime"
            @cancel="estShow = false"
            v-model="estTime"
            @close="estShow = false"
            @confirm="handleStartTimeConfirm"
        >
        </u-datetime-picker>
        <u-datetime-picker
            closeOnClickOverlay
            :show="eetShow"
            mode="datetime"
            @cancel="eetShow = false"
            v-model="eetTime"
            @close="eetShow = false"
            @confirm="handleEndTimeConfirm"
        >
        </u-datetime-picker>

        <u-button
            v-if="formModel.createdAt"
            size="small"
            type="primary"
            text="参与人"
            @click="editParticipant"
        >
        </u-button>
        <view class="w-form-btn-content">
            <!-- <u-button size="small" v-if="isButtonVisible('save')" :disabled="isSaveDisabled()" type="primary" text="保存"
				@click="save">
			</u-button>
			<u-button size="small" v-if="isButtonVisible('submit')" :disabled="isSubmitDisabled()" type="primary"
				text="提交" @click="saveAndSubmit">
			</u-button> -->
            <u-button
                size="small"
                v-if="isSaveAndSubmitVisible()"
                type="primary"
                text="提交"
                @click="saveAndSubmit"
            >
            </u-button>
            <u-button
                size="small"
                v-if="isStartVisible()"
                type="success"
                text="开始"
                @click="start"
            >
            </u-button>
            <u-button
                size="small"
                v-if="isEndVisible()"
                type="error"
                text="结束"
                @click="end"
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
                create: '新增安全教育培训',
                update: '编辑安全教育培训',
                detail: '安全教育培训详情'
            },
            type: '',
            formModel: {
                id: '',
                project: null,
                code: '',
                subject: '',
                trainer: null,
                allWorkers: true,
                estimatedStartTime: '',
                estimatedEndTime: '',
                address: '',
                files: []
            },
            estShow: false,
            eetShow: false,
            estTime: Number(new Date()),
            eetTime: Number(new Date()),
            files: [],
            rules: {
                project: [
                    { type: 'object', required: true, message: '请选择项目' }
                ],
                subject: {
                    type: 'string',
                    required: true,
                    message: '请填写培训主题'
                },
                estimatedStartTime: {
                    type: 'string',
                    required: true,
                    message: '请填写预计开始时间'
                },
                estimatedEndTime: {
                    type: 'string',
                    required: true,
                    message: '请填写预计结束时间'
                },
                address: {
                    type: 'string',
                    required: true,
                    message: '请填写培训地点'
                }
            },
            projects: [],
            projectPickerVisible: false
        };
    },
    onLoad(option) {
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
                this.setAddress();
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
                        this.setAddress();
                    }
                }
            });
        },
        setAddress() {
            if (this.formModel.project.shortName.endsWith('项目')) {
                this.formModel.address =
                    this.formModel.project.shortName + '部';
            } else {
                this.formModel.address =
                    this.formModel.project.shortName + '项目部';
            }
        },
        findOne() {
            uni.request({
                url: '/api/ss/safety-training/find-one-with-files',
                data: {
                    id: this.formModel.id
                },
                success: (res) => {
                    this.formModel = res.data;
                    if (this.formModel.estimatedStartTime) {
                        this.estTime = Date.parse(
                            this.formModel.estimatedStartTime
                        );
                    }
                    if (this.formModel.estimatedEndTime) {
                        this.eetTime = Date.parse(
                            this.formModel.estimatedEndTime
                        );
                    }
                    if (this.formModel.files) {
                        this.files = this.formModel.files.map((file) =>
                            uni.convertToFile(file)
                        );
                    }
                    this.getProjects();
                }
            });
        },
        save() {
            this.$refs.form
                .validate()
                .then(() => {
                    uni.request({
                        url: '/api/ss/safety-training/save',
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
                .catch(() => this.verificationFailed());
        },
        verificationFailed() {
            uni.showToast({
                title: '请完成填写后提交',
                icon: 'none'
            });
        },
        saveAndSubmit() {
            this.$refs.form
                .validate()
                .then(() => {
                    uni.request({
                        url: '/api/ss/safety-training/save-and-submit',
                        method: 'POST',
                        header: {
                            'Content-Type': 'application/json'
                        },
                        data: this.formModel,
                        success: () => this.afterSubmit()
                    });
                })
                .catch(() =>
                    uni.showToast({
                        title: '请完成填写后提交',
                        icon: 'none'
                    })
                );
        },
        submit() {
            uni.request({
                url: '/api/ss/safety-training/submit',
                method: 'PUT',
                data: {
                    id: this.formModel.id
                },
                success: () => this.afterSubmit()
            });
        },
        afterSubmit() {
            uni.showModal({
                title: '提交成功',
                success: () => {
                    uni.navigateBack();
                }
            });
        },
        start() {
            this.$refs.form
                .validate()
                .then(() => {
                    uni.showModal({
                        title: '确定开始吗?',
                        success: (res) => {
                            if (res.confirm) {
                                uni.request({
                                    url: '/api/ss/safety-training/start',
                                    method: 'PUT',
                                    data: {
                                        id: this.formModel.id
                                    },
                                    success: () =>
                                        uni.showModal({
                                            title: '开始成功',
                                            success: () => {
                                                uni.navigateBack();
                                            }
                                        })
                                });
                            }
                        }
                    });
                })
                .catch(() => this.verificationFailed());
        },
        end() {
            if (!this.formModel.files || this.formModel.files.length === 0) {
                uni.showToast({
                    title: '请上传培训过程图片',
                    icon: 'none'
                });
                return;
            }
            uni.showModal({
                title: '确定结束吗?',
                success: (res) => {
                    if (res.confirm) {
                        let url =
                            '/api/ss/safety-training/end?id=' +
                            this.formModel.id;
                        if (this.files) {
                            this.files.forEach(
                                (file) => (url += '&file.id=' + file.id)
                            );
                        }
                        uni.request({
                            url,
                            method: 'PUT',
                            data: {
                                result: this.formModel.result
                            },
                            success: () =>
                                uni.showModal({
                                    title: '结束成功',
                                    success: () => {
                                        uni.navigateBack();
                                    }
                                })
                        });
                    }
                }
            });
        },
        // isSaveDisabled() {
        // 	return this.formModel.allWorkers || this.formModel.id;
        // },
        // isSubmitDisabled() {
        // 	return !this.formModel.id || this.formModel.submittedAt;
        // },
        isSaveAndSubmitVisible() {
            return this.formModel.allWorkers && !this.formModel.submittedAt;
        },
        isStartVisible() {
            return (
                this.formModel.trainer &&
                this.formModel.trainer.person &&
                this.formModel.trainer.person.id ===
                    uni.getUserDetails().person.id &&
                this.formModel.submittedAt &&
                !this.formModel.startedAt
            );
        },
        isEndVisible() {
            return (
                this.formModel.trainer &&
                this.formModel.trainer.person &&
                this.formModel.trainer.person.id ===
                    uni.getUserDetails().person.id &&
                this.formModel.startedAt &&
                !this.formModel.endedAt
            );
        },
        editParticipant() {
            uni.navigateTo({
                url: `../../safety-training-participant/list/list?training.id=${this.formModel.id}`
            });
        },
        async afterReadPicture(event) {
            const file = JSON.parse(await uni.upload(event.file, false))[0];
            if (!this.formModel.files) {
                this.formModel.files = [];
            }
            this.formModel.files.push(file);
            this.files.push(uni.convertToFile(file));
        },
        deletePicture(event) {
            return new Promise((resolve) => {
                uni.request({
                    url: '/api/ss/safety-training/delete-file-by-asset',
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
        },
        handleStartTimeConfirm(e) {
            this.estShow = false;
            this.formModel.estimatedStartTime = uni.$u.timeFormat(
                e.value,
                'yyyy-mm-dd hh:MM:ss'
            );
        },
        handleEndTimeConfirm(e) {
            this.eetShow = false;
            this.formModel.estimatedEndTime = uni.$u.timeFormat(
                e.value,
                'yyyy-mm-dd hh:MM:ss'
            );
        }
    }
};
</script>

<style>
.toolbar {
    display: flex;
}

.toolbar button {
    margin-right: 8rpx;
}

.toolbar :last-child {
    margin-right: 0;
}
</style>
