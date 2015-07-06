module MetaRequest
  class Storage
    attr_reader :key

    FILE_POOL_SIZE = 100

    def initialize(key)
      @key = key
    end

    def write(value)
      FileUtils.mkdir_p dir_path
      File.open(json_file, 'wb') { |file| file.write(value) }
      maintain_file_pool(FILE_POOL_SIZE)
    end

    def read
      File.exist?(json_file) ? File.read(json_file) : ''
    end

    private

    def maintain_file_pool(size)
      files = Dir["#{dir_path}/*.json"]
      files = files.sort_by { |f| -file_ctime(f) }
      (files[size..-1] || []).each do |file|
        FileUtils.rm_f(file)
      end
    end

    def file_ctime(file)
      File.stat(file).ctime.to_i
    rescue Errno::ENOENT
      0
    end

    def json_file
      File.join(dir_path, "#{key}.json")
    end

    def dir_path
      File.join(Rails.root, 'tmp', 'data', 'meta_request')
    end
  end
end
