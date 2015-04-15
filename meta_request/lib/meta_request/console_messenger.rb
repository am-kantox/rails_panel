require 'callsite'

module MetaRequest
  module ConsoleMessenger

    def debug(message = nil, &block)
      push_event(:debug, message)
      super
    end

    def info(message = nil, &block)
      push_event(:info, message)
      super
    end

    def warn(message = nil, &block)
      push_event(:warn, message)
      super
    end

    def error(message = nil, &block)
      push_event(:error, message)
      super
    end

    def fatal(message = nil, &block)
      push_event(:fatal, message)
      super
    end

    def unknown(message = nil, &block)
      push_event(:unknown, message)
      super
    end


    private
    OMIT_CALLS = %w(active_support/notifications.* instrumentation log_interceptor log_subscriber console_messenger logger tagged_logging)
    def push_event(level, message)
      if dev_log = AppRequest.current
        c = caller.detect { |cc| cc.split(':').first =~ /\A#{Rails.root}/ } ||
            caller.detect do |cc|
              not OMIT_CALLS.any? do |oc|
                cc.split(':').first =~ /(#{oc}.rb|\(eval\))$/
              end
            end ||
            caller[2]
        c = Callsite.parse(c)
        payload = {:message => message, :level => level, :line => c.line, :filename => c.filename, :method => c.method}
        evt = Event.new('console_logger.message', 0, 0, 0, payload)
        AppRequest.current.events << evt # FIXME unless AppRequest.current.events.include? evt
      end
    rescue Exception => e
      MetaRequest.logger.fatal(e.message + "\n " + e.backtrace.join("\n "))
    end
  end
end
